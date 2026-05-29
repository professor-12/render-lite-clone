import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import express, { type NextFunction, type Request, type Response } from 'express';
import { prisma } from '../../libs/prisma';
import { downloadArtifact } from '../../libs/deploy/download-artifact';
import { createLogger } from '../../libs/logger';

const log = createLogger({ module: 'static-host' });

const CACHE_ROOT = path.join(os.tmpdir(), 'renderlite-static');
const RESERVED_SUBDOMAINS = new Set(['', 'www', 'api', 'admin']);

type ResolvedSite = {
  deploymentId: string;
  artifactUrl: string;
  subdomain: string;
};

const projectLookupCache = new Map<string, { resolved: ResolvedSite | null; cachedAt: number }>();
const PROJECT_LOOKUP_TTL_MS = 5_000;

const siteDirCache = new Map<string, string>();
const inflightPrep = new Map<string, Promise<string>>();

function parseSubdomain(host: string | undefined): string | null {
  if (!host) return null;
  const hostname = host.split(':')[0].toLowerCase();
  const labels = hostname.split('.').filter(Boolean);
  if (labels.length < 2) return null;
  const sub = labels[0];
  if (RESERVED_SUBDOMAINS.has(sub)) return null;
  // Only treat `<sub>.localhost(.something)` or `<sub>.<rest>` as a tenant host
  // when there is at least one non-empty label after the subdomain.
  return sub;
}

async function resolveSiteForSubdomain(subdomain: string): Promise<ResolvedSite | null> {
  const cached = projectLookupCache.get(subdomain);
  if (cached && Date.now() - cached.cachedAt < PROJECT_LOOKUP_TTL_MS) {
    return cached.resolved;
  }

  const project = await prisma.project.findUnique({
    where: { domain: subdomain },
    select: {
      id: true,
      projectType: true,
      deployments: {
        where: { status: 'live', projectType: 'static' },
        orderBy: { updatedAt: 'desc' },
        take: 1,
        select: { id: true, image: true },
      },
    },
  });

  let resolved: ResolvedSite | null = null;
  if (project && project.projectType === 'static') {
    const latest = project.deployments[0];
    if (latest && latest.image) {
      resolved = { deploymentId: latest.id, artifactUrl: latest.image, subdomain };
    }
  }
  projectLookupCache.set(subdomain, { resolved, cachedAt: Date.now() });
  return resolved;
}

async function extractZipFile(zipPath: string, destDir: string): Promise<void> {
  await fs.mkdir(destDir, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const child = spawn('unzip', ['-q', '-o', zipPath, '-d', destDir], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (d: string) => {
      stderr += d;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`unzip failed (${code}): ${stderr}`));
    });
  });
}

async function prepareSiteDir(site: ResolvedSite): Promise<string> {
  const cached = siteDirCache.get(site.deploymentId);
  if (cached) return cached;

  const existing = inflightPrep.get(site.deploymentId);
  if (existing) return existing;

  const work = (async () => {
    const targetDir = path.join(CACHE_ROOT, site.deploymentId);
    const readyMarker = path.join(targetDir, '.ready');
    try {
      await fs.access(readyMarker);
      siteDirCache.set(site.deploymentId, targetDir);
      return targetDir;
    } catch {
      // not ready yet
    }

    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(targetDir, { recursive: true });

    const tmpZip = path.join(CACHE_ROOT, `${site.deploymentId}.zip`);
    log.info({ deploymentId: site.deploymentId }, 'Downloading static artifact');
    await downloadArtifact({ url: site.artifactUrl, destPath: tmpZip });
    log.info({ deploymentId: site.deploymentId }, 'Extracting static artifact');
    await extractZipFile(tmpZip, targetDir);
    await fs.rm(tmpZip, { force: true });
    await fs.writeFile(readyMarker, new Date().toISOString());
    siteDirCache.set(site.deploymentId, targetDir);
    return targetDir;
  })();

  inflightPrep.set(site.deploymentId, work);
  try {
    return await work;
  } finally {
    inflightPrep.delete(site.deploymentId);
  }
}

export function staticHostMiddleware() {
  return async function staticHost(req: Request, res: Response, next: NextFunction) {
    const subdomain = parseSubdomain(req.headers.host);
    if (!subdomain) return next();

    let site: ResolvedSite | null;
    try {
      site = await resolveSiteForSubdomain(subdomain);
    } catch (err) {
      log.warn({ err, subdomain }, 'Static host lookup failed');
      return next();
    }
    if (!site) return next();

    let siteDir: string;
    try {
      siteDir = await prepareSiteDir(site);
    } catch (err) {
      log.error({ err, deploymentId: site.deploymentId }, 'Failed to prepare static site');
      res.status(502).type('text/plain').send('Static site is not available');
      return;
    }

    const serve = express.static(siteDir, {
      index: 'index.html',
      fallthrough: true,
      extensions: ['html'],
    });

    serve(req, res, async (err) => {
      if (err) return next(err);
      // SPA fallback: if the URL is not a file request, serve index.html.
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      const indexPath = path.join(siteDir, 'index.html');
      try {
        await fs.access(indexPath);
      } catch {
        return next();
      }
      res.sendFile(indexPath);
    });
  };
}

export function invalidateStaticSiteCache(deploymentId: string): void {
  siteDirCache.delete(deploymentId);
}
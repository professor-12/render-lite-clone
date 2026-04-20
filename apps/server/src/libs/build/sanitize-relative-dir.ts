/** Reject absolute paths and traversal for user-controlled relative dirs (rootDir, outDir). */
export function sanitizeRelativeDir(value?: string | null): string | null {
  const v = value?.trim();
  if (!v || v === '.' || v === './') return null;
  if (v.startsWith('/') || v.includes('..')) return null;
  return v;
}

/** Safe single-quoted string for embedding in bash. */
export function bashSingleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

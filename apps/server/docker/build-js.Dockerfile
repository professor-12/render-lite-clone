FROM node:20-bookworm

# Activate pnpm and yarn at fixed versions via corepack (ships with Node 20).
# Doing this at image build time means user jobs no longer pay the ~30s of
# `npm install -g pnpm yarn` on every build.
RUN corepack enable \
 && corepack prepare pnpm@9.15.0 --activate \
 && corepack prepare yarn@1.22.22 --activate

# Fail fast if any tool is missing from the image.
RUN node -v && npm -v && pnpm -v && yarn -v

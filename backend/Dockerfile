FROM node:22-alpine AS build

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace backend --include-workspace-root=false

COPY backend/tsconfig.json backend/tsconfig.json
COPY backend/src backend/src
RUN npm run build --workspace backend

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev --workspace backend --include-workspace-root=false \
    && npm cache clean --force

COPY --from=build --chown=node:node /workspace/backend/dist backend/dist
USER node
WORKDIR /workspace/backend

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/server.js"]

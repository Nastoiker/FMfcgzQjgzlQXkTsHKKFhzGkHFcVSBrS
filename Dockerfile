FROM node:22-bookworm-slim AS provider
WORKDIR /app
COPY package.json ./
COPY scripts/provider.js scripts/provider.js
USER node
CMD ["node","scripts/provider.js"]

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY prisma prisma
RUN npm ci && npx prisma generate
COPY apps apps
RUN npm run typecheck && npm run build:web

FROM build AS api
USER node
CMD ["sh","-c","npm run preparedb && node apps/api/dist/main.js"]

FROM api AS benchmark
COPY scripts/perf-db.js scripts/perf-seed.js scripts/perf-benchmark.js scripts/

FROM nginxinc/nginx-unprivileged:stable-alpine AS web
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist/ /usr/share/nginx/html/

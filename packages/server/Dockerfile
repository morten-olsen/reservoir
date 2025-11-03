FROM node:23-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS builder
RUN npm i -g turbo
COPY . .
RUN turbo prune @morten-olsen/reservoir-server --docker

FROM base AS installer
COPY --from=builder /app/out/json/ .
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/out/full/ .

FROM base AS runner
ENV \
  SERVER_HOST=0.0.0.0 \
  DB_URL=/data/db.sqlite
RUN \
  addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodejs \
  && mkdir /data \
  && chown nodejs:nodejs /data
USER nodejs

COPY --from=installer /app /app
CMD ["node", "/app/packages/server/src/start.ts"]

FROM oven/bun:1-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time dummy env vars (not embedded in image, only exists in builder stage)
RUN printf 'DATABASE_URL=postgresql://placeholder:5432/placeholder\nPAYLOAD_SECRET=build-placeholder-must-be-at-least-32-chars-long\n' > .env.local
RUN bun run build

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache curl
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER appuser
EXPOSE 3000
CMD ["bun", "server.js"]

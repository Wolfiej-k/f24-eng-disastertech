FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build source code
FROM base AS builder
WORKDIR /app

ENV NEXT_PUBLIC_URL="http://127.0.0.1:3000"
ENV API_PORT=4000

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Run Next.js server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE ${PORT}

CMD ["node", "server.js"]

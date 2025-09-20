############################
# Base image
############################
FROM node:alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

############################
# Install deps (with dev) for building
############################
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

############################
# Build Next.js
############################
FROM base AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

############################
# Production-only node_modules (small)
############################
FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

############################
# Bundle the custom server (TS -> single JS file)
############################
FROM base AS server-bundle
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm i --no-save esbuild@0.23.x
COPY src/server.ts ./src/server.ts
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npx esbuild ./src/server.ts --bundle --platform=node --target=node20 --format=cjs --external:next --tsconfig=tsconfig.json --outfile=server.cjs

############################
# Final runtime image (minimal)
############################
FROM node:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
RUN apk add --no-cache libc6-compat
RUN npm install pm2 -g
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=prod-deps /app/prisma ./prisma
COPY --from=prod-deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prod-deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=server-bundle /app/server.cjs ./server.cjs
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
USER nextjs
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["pm2-runtime", "server.cjs"]
# Stage 1: Build the Nuxt application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies with retry and clean install
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

ENV NUXT_TELEMETRY_DISABLED=1

# Build production output
RUN npm run build

# Stage 2: Minimal production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy Nitro server output from builder
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

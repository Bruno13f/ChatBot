# Step 1: Build stage
FROM node:18-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Accept build arguments from docker-compose
ARG BACKEND_URI
ARG SOCKET_MIDDLEWARE_URI
ARG BACKEND_SOCKET_URI

# Remove production env file and create clean one if args provided
RUN if [ ! -z "$BACKEND_URI" ] || [ ! -z "$SOCKET_MIDDLEWARE_URI" ] || [ ! -z "$BACKEND_SOCKET_URI" ]; then \
      rm -f .env.production.local && \
      echo "NEXT_PUBLIC_BACKEND_URI=${BACKEND_URI}" > .env.production.local && \
      echo "NEXT_PUBLIC_SOCKET_MIDDLEWARE_URI=${SOCKET_MIDDLEWARE_URI}" >> .env.production.local && \
      echo "NEXT_PUBLIC_BACKEND_SOCKET_URI=${BACKEND_SOCKET_URI}" >> .env.production.local; \
    fi

RUN pnpm build

# Step 2: Runner stage
FROM node:18-alpine AS runner

ENV NODE_ENV=production

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["pnpm", "start"]

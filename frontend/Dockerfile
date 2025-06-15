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

# Create a clean .env file with ONLY the provided arguments
RUN rm -f .env .env.local .env.production .env.production.local && \
    echo "# Generated environment file" > .env && \
    if [ ! -z "$BACKEND_URI" ]; then \
      echo "NEXT_PUBLIC_BACKEND_URI=${BACKEND_URI}" >> .env; \
    fi && \
    if [ ! -z "$SOCKET_MIDDLEWARE_URI" ]; then \
      echo "NEXT_PUBLIC_SOCKET_MIDDLEWARE_URI=${SOCKET_MIDDLEWARE_URI}" >> .env; \
    fi && \
    if [ ! -z "$BACKEND_SOCKET_URI" ]; then \
      echo "NEXT_PUBLIC_BACKEND_SOCKET_URI=${BACKEND_SOCKET_URI}" >> .env; \
    fi

# Show final env for debugging
RUN echo "Clean .env contents:" && cat .env

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
COPY --from=builder /app/.env .env

EXPOSE 3000

CMD ["pnpm", "start"]

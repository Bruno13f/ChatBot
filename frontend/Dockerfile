# Step 1: Build stage
FROM node:18-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Accept env file as build ARG
ARG ENV_FILE=.env.local
COPY ${ENV_FILE} .env

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

# Use Bun as the base image
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package*.json ./

RUN bun install --production

COPY . .

FROM oven/bun:1 AS runner

# Set environment variables (optional)
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8000

CMD ["bun", "index.ts"]

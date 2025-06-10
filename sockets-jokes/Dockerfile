# Use a smaller Node.js base image (e.g., alpine-based)
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

FROM node:18-alpine AS runner

# Set environment variables (optional)
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000

CMD ["node", "index.js"]

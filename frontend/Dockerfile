# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Vite reads VITE_* vars at build time, so pass API base URL as a build arg.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]


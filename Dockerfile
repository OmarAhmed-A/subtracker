# Stage 1: Build frontend
FROM node:22-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:22-slim
WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev

COPY backend/ ./backend/
COPY --from=frontend /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=8000
ENV DATA_DIR=/app/data
ENV SECRET_KEY=change-me-in-production

EXPOSE 8000

VOLUME ["/app/data"]

CMD ["node", "backend/server.js"]

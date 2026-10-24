FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3-venv ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN python3 -m venv .venv && .venv/bin/pip install --no-cache-dir semgrep==1.182.1
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.ts ./next.config.ts
RUN mkdir -p /app/.data && chown -R node:node /app
USER node
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "npm start -- --port ${PORT:-8080}"]

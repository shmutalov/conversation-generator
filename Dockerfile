# syntax=docker/dockerfile:1.6

FROM node:20-bookworm-slim AS web-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json remotion.config.ts ./
COPY src ./src
COPY web ./web
RUN npm run ui:build


FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3838 \
    HOST=0.0.0.0 \
    CHROMIUM_PATH=/usr/bin/chromium

RUN apt-get update && apt-get install -y --no-install-recommends \
        chromium \
        ffmpeg \
        fonts-liberation \
        fonts-noto-color-emoji \
        fontconfig \
        ca-certificates \
        dumb-init \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY tsconfig.json remotion.config.ts ./
COPY src ./src
COPY scripts ./scripts
COPY --from=web-build /app/web-dist ./web-dist

RUN useradd --system --home /app --shell /usr/sbin/nologin app \
    && chown -R app:app /app
USER app

EXPOSE 3838

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "scripts/render-server.mjs"]

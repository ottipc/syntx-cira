# CIRA workspace (F07): production build served statically; the API URL is injected into <meta name="cira-api"> at start.
FROM node:22-slim AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npx vite build

FROM nginx:1.29-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/deploy/40-cira-api.sh /docker-entrypoint.d/40-cira-api.sh
ENV CIRA_API=http://127.0.0.1:8000
EXPOSE 4173
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD wget -qO- http://127.0.0.1:4173/ | grep -q 'name="cira-api"'

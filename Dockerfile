# --- build stage ---
FROM node:20-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
# If you don't have a lock file, this falls back to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# --- runtime stage ---
FROM nginx:1.27-alpine
# Nginx config replaces default server and proxies /api to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

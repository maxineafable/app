FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM caddy:2-alpine AS production

COPY Caddyfile /etc/caddy/Caddyfile

COPY --from=build /app/dist /usr/share/caddy

EXPOSE 80
EXPOSE 443
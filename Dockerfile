# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV VITE_SUPABASE_URL=https://db.myqbanks.com
ENV VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTczNTE1NzQ2MCwiZXhwIjo0ODkwODMxMDYwLCJyb2xlIjoiYW5vbiJ9.ZkGjj3uKA7_m0J4SN0BszuOnG0Sqfz-DIIwFRTvYWKc
ENV VITE_APP_URL=https://payment.freemedtube.net
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

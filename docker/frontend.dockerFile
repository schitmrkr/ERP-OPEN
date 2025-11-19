FROM node:20-alpine AS builder

WORKDIR /app
COPY ../../apps/frontend/package.json .
COPY ../../apps/frontend/package-lock.json .
RUN rm -f package-lock.json && npm install
COPY ../../apps/frontend .
RUN npm run build



FROM nginx:stable-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

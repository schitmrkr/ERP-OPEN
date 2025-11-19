# -------- Build Stage --------
FROM node:20-alpine AS builder
WORKDIR /app

COPY ../../apps/backend/package*.json ./
RUN npm ci --omit=dev --no-optional

COPY ../../apps/backend .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY ../../apps/backend/package*.json ./
RUN npm ci --omit=dev --no-optional

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN npm cache clean --force
RUN rm -rf /root/.npm /root/.cache

EXPOSE 4000
CMD ["node", "dist/main.js"]

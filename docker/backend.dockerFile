# -------- Build Stage --------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY ../../apps/backend/package.json ../../apps/backend/package-lock.json ./
RUN npm ci --omit=dev --no-optional

# Copy source code
COPY ../../apps/backend .

# Set a dummy DATABASE_URL so Prisma can generate binaries
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma client for Linux ARM (compatible with Alpine)
RUN npx prisma generate

# Build the application
RUN npm run build

# -------- Runner Stage --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only production dependencies
COPY ../../apps/backend/package.json ../../apps/backend/package-lock.json ./
RUN npm ci --omit=dev --no-optional

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma client from builder
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Cleanup npm cache to reduce image size
RUN npm cache clean --force \
    && rm -rf /root/.npm /root/.cache

EXPOSE 3000
CMD ["node", "dist/main.js"]

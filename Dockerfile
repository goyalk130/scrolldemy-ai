FROM node:20-slim AS builder

# Install core build dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for Docker caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production runtime image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# CRITICAL FOR REMOTION: Install Chromium and its Linux GUI dependencies
# Since Remotion spawns headless Chrome to render matching frames,
# production Linux servers must have these exact system libraries installed.
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Next.js standalone minimizes container size by extracting only used files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder /app/src/remotion ./src/remotion

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Uses the optimized standalone Node.js server instead of 'npm start'
CMD ["node", "server.js"]

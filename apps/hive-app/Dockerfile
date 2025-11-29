FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && (pnpm install --frozen-lockfile || npm install)

# Copy source
COPY . .

# Build (if needed)
RUN pnpm build || npm run build || true

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || true

# Start
CMD ["pnpm", "start"] || ["npm", "start"]

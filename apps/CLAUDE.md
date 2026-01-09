# Mobius Apps Workspace

**Type:** Application workspace (frontend + backend services)
**Count:** 15+ applications
**Tech Stack:** Next.js, Express, Node.js 20

---

## 📂 Applications

### Frontend Apps (Next.js)
- **portal/** - Main Kaizen OS portal (port 3002)
- **habits-web/** - Habits tracking application
- **mobius-landing/** - Public landing page
- **aurea-site/** - AUREA agent interface
- **mobius-companion/** - Companion app
- **integrity-pulse/** - Integrity monitoring
- **website-creator/** - Website creation tool

### Backend Services (Express)
- **broker-api/** - Broker service (port 4005)
- **cathedral-app/** - Cathedral service (port 3002)
- **eomm-api/** - EOMM API (port 4003)
- **indexer-api/** - Indexer service
- **api-gateway/** - API gateway
- **shield-api/** - Shield service
- **dva-lite-api/** - DVA Lite API
- **encyclopedia-api/** - Encyclopedia API

---

## 🚀 Development

### Running Apps

**Frontend (Next.js):**
```bash
# Development
cd apps/portal
npm run dev  # Starts on configured port

# Build
npm run build

# Production
npm run start
```

**Backend (Express):**
```bash
# Development
cd apps/broker-api
npm run dev  # Usually has nodemon

# Production
npm run start
```

### Environment Variables

**Next.js Apps:**
- `NEXT_PUBLIC_API_BASE` - API base URL
- `NEXT_PUBLIC_PORTAL_ORIGIN` - Portal origin
- `NEXT_PUBLIC_ENABLE_*` - Feature flags

**Express Apps:**
- `PORT` - Service port
- `DATABASE_URL` - PostgreSQL connection (if needed)
- `NODE_ENV` - Environment (development/production)

---

## 📦 Dependencies

### Install from Root
```bash
# In monorepo root, not in app directory
npm ci
```

All apps share dependencies via npm workspaces. Individual app package.json files declare their needs, but installation happens at root.

### Workspace Dependencies
Apps can depend on local packages:
```json
{
  "dependencies": {
    "@civic/integrity-core": "workspace:*",
    "@civic/civic-sdk": "workspace:*"
  }
}
```

---

## 🐳 Docker

### Standard Dockerfile Pattern
All apps use standardized npm-only Dockerfiles:

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE <port>

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:<port>/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start
CMD ["npm", "start"]
```

### .dockerignore
All apps have `.dockerignore` files that exclude:
- `node_modules/`
- `.next/`
- `dist/`
- Development files
- Documentation

### Multi-Stage Templates
See `.docker/Dockerfile.template` for optimized multi-stage builds:
- Stage 1: Production dependencies only
- Stage 2: Build with dev dependencies
- Stage 3: Minimal runtime image
- **Expected size:** 70% reduction (1.2GB → 350MB)

---

## 🧪 Testing

### Run Tests
```bash
# All apps
npx turbo run test

# Specific app
npm run test --workspace=apps/portal

# With coverage
npm run test:coverage --workspace=apps/portal
```

### Type Checking
```bash
# All apps
npx turbo run type-check

# Specific app
cd apps/portal
npx tsc --noEmit
```

### Linting
```bash
# All apps
npx turbo run lint

# Specific app
npm run lint --workspace=apps/portal
```

---

## 📋 Adding New Apps

### 1. Create Directory
```bash
mkdir apps/my-new-app
cd apps/my-new-app
```

### 2. Initialize package.json
```json
{
  "name": "@mobius/my-new-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "...",
    "build": "...",
    "start": "...",
    "lint": "...",
    "test": "..."
  },
  "dependencies": {
    // Your deps
  }
}
```

### 3. Add Dockerfile
Copy from `.docker/Dockerfile.template` and customize:
- Update `EXPOSE` port
- Update health check endpoint
- Adjust build command if needed

### 4. Add .dockerignore
```bash
cp .docker/.dockerignore.template apps/my-new-app/.dockerignore
```

### 5. Update Catalog
```bash
npm run export:catalog
git add catalog/mobius_catalog.json
```

### 6. CI Validation
New apps are automatically:
- Built by Turbo in CI
- Linted and type-checked
- Tested (if tests exist)

---

## ⚠️ Common Issues

### "Module not found" from local package
```bash
# Ensure you installed from root
cd /path/to/Mobius-Substrate
npm ci

# Turbo should build dependencies first
npx turbo run build
```

### "Port already in use"
```bash
# Check running processes
lsof -i :3002

# Kill if needed
kill -9 <PID>

# Or use different port
PORT=3003 npm run dev
```

### Next.js build fails
```bash
# Common causes:
# 1. Missing env vars (check .env.example)
# 2. Dependency not built (run npx turbo run build)
# 3. Type errors (run npx tsc --noEmit)
```

### Docker build fails
```bash
# Ensure .dockerignore exists
ls -la .dockerignore

# Build from monorepo root
docker build -f apps/my-app/Dockerfile .

# NOT from app directory
```

---

## 🔧 Best Practices

1. **Always install from root**: `npm ci` at monorepo root
2. **Use workspace protocol**: `"@civic/pkg": "workspace:*"`
3. **Consistent ports**: Document in app README
4. **Health checks**: All apps should have `/health` or `/healthz`
5. **Environment vars**: Use `.env.example` for documentation
6. **Type safety**: Run `npx tsc --noEmit` before committing
7. **Build order**: Turbo handles it, but be aware of dep tree
8. **Docker builds**: Always from monorepo root, not app dir

---

## 📚 References

- **Root README:** `../README.md`
- **Docker templates:** `../.docker/`
- **CI workflows:** `../.github/workflows/`
- **Shared packages:** `../packages/`

---

*Part of Mobius Substrate Monorepo* 🌀

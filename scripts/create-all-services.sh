#!/bin/bash
# create-all-services.sh
# Creates all 9 missing Mobius services at once
# Cycle C-150

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  MOBIUS SERVICE GENERATOR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Creating all missing services..."
echo ""

# Service definitions
# Format: "name:type:port"
SERVICES=(
  "ledger-api:api:4001"
  "indexer-api:api:4002"
  "eomm-api:api:4003"
  "shield-api:api:4004"
  "broker-api:api:4005"
  "hive-app:frontend:3001"
  "cathedral-app:frontend:3002"
  "genesisdome-app:frontend:3003"
  "hub-web:frontend:3004"
)

# Create apps directory if it doesn't exist
mkdir -p apps

for service in "${SERVICES[@]}"; do
  IFS=':' read -r name type port <<< "$service"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Checking: $name ($type on port $port)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  SERVICE_DIR="apps/$name"
  
  # Skip if already exists and has implementation
  if [ -d "$SERVICE_DIR" ] && [ -f "$SERVICE_DIR/package.json" ]; then
    echo "⚠️  $name already exists with package.json, skipping..."
    echo ""
    continue
  fi
  
  # Create directory structure
  mkdir -p "$SERVICE_DIR/src"
  mkdir -p "$SERVICE_DIR/tests"
  
  # Generate based on type
  if [ "$type" == "api" ]; then
    # ====================
    # API Service
    # ====================
    
    # package.json
    cat > "$SERVICE_DIR/package.json" << EOF
{
  "name": "@mobius/$name",
  "version": "0.1.0",
  "private": true,
  "description": "$(case "$name" in
    "ledger-api") echo "Mobius Ledger Core - Immutable integrity attestations";;
    "indexer-api") echo "MIC Indexer - Token balances and transaction history";;
    "eomm-api") echo "E.O.M.M. Reflections - Daily SML implementation";;
    "shield-api") echo "Citizen Shield - Security request guards";;
    "broker-api") echo "Thought Broker - Multi-LLM consensus orchestration";;
    *) echo "Mobius API Service";;
  esac)",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "lint": "eslint src",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4",
    "eslint": "^8.56.0"
  }
}
EOF
    
    # src/index.ts
    cat > "$SERVICE_DIR/src/index.ts" << 'INDEX_EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || SERVICE_PORT_PLACEHOLDER;

app.use(cors());
app.use(express.json());

// Health check endpoint (required for all services)
app.get('/healthz', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SERVICE_NAME_PLACEHOLDER',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    uptime: process.uptime()
  });
});

// API routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    service: 'SERVICE_NAME_PLACEHOLDER',
    status: 'operational',
    features: []
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`✅ SERVICE_NAME_PLACEHOLDER listening on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
});
INDEX_EOF
    
    # Replace placeholders
    sed -i "s/SERVICE_PORT_PLACEHOLDER/$port/g" "$SERVICE_DIR/src/index.ts"
    sed -i "s/SERVICE_NAME_PLACEHOLDER/$name/g" "$SERVICE_DIR/src/index.ts"
    
  elif [ "$type" == "frontend" ]; then
    # ====================
    # Frontend Service
    # ====================
    
    # package.json
    cat > "$SERVICE_DIR/package.json" << EOF
{
  "name": "@mobius/$name",
  "version": "0.1.0",
  "private": true,
  "description": "$(case "$name" in
    "hive-app") echo "Citizen Hive - Citizen interface";;
    "cathedral-app") echo "Cathedral - Governance UI";;
    "genesisdome-app") echo "Genesis Dome - Genesis interface";;
    "hub-web") echo "Hub Web - Main portal aggregating all services";;
    *) echo "Mobius Frontend";;
  esac)",
  "scripts": {
    "dev": "next dev -p $port",
    "build": "next build",
    "start": "next start -p $port",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4"
  }
}
EOF
    
    # next.config.js
    cat > "$SERVICE_DIR/next.config.js" << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF
    
    # src/app/page.tsx
    mkdir -p "$SERVICE_DIR/src/app"
    cat > "$SERVICE_DIR/src/app/page.tsx" << EOF
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🌀 $name</h1>
      <p>Mobius Systems Frontend</p>
      <p style={{ color: '#666' }}>Port: $port</p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <p><strong>Status:</strong> ✅ Operational</p>
        <p><strong>Version:</strong> 0.1.0</p>
      </div>
    </main>
  );
}
EOF
    
    # src/app/layout.tsx
    cat > "$SERVICE_DIR/src/app/layout.tsx" << EOF
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$name - Mobius Systems',
  description: 'Mobius Systems Frontend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF
  fi
  
  # Common files for both types
  
  # tsconfig.json
  cat > "$SERVICE_DIR/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "$([ "$type" == "api" ] && echo "commonjs" || echo "esnext")",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "jsx": "$([ "$type" == "frontend" ] && echo "preserve" || echo "react")",
    "incremental": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", ".next"]
}
EOF
  
  # Dockerfile
  cat > "$SERVICE_DIR/Dockerfile" << EOF
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile || npm install

# Copy source
COPY . .

# Build
RUN pnpm build || npm run build

# Expose port
EXPOSE $port

# Start
CMD ["pnpm", "start"] || ["npm", "start"]
EOF
  
  # .dockerignore
  cat > "$SERVICE_DIR/.dockerignore" << EOF
node_modules
dist
.next
.turbo
*.log
.env.local
.env
.git
.gitignore
README.md
EOF
  
  # README.md
  cat > "$SERVICE_DIR/README.md" << EOF
# $name

**Type:** $type  
**Port:** $port  
**Status:** Boilerplate generated

## Description

$(case "$name" in
  "ledger-api") echo "Mobius Ledger Core - Immutable integrity attestations";;
  "indexer-api") echo "MIC Indexer - Token balances and transaction history";;
  "eomm-api") echo "E.O.M.M. Reflections - Daily SML implementation";;
  "shield-api") echo "Citizen Shield - Security request guards";;
  "broker-api") echo "Thought Broker - Multi-LLM consensus orchestration";;
  "hive-app") echo "Citizen Hive - Citizen interface";;
  "cathedral-app") echo "Cathedral - Governance UI";;
  "genesisdome-app") echo "Genesis Dome - Genesis interface";;
  "hub-web") echo "Hub Web - Main portal aggregating all services";;
esac)

## Development

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Visit: http://localhost:$port

## Build

\`\`\`bash
pnpm build
\`\`\`

## Start

\`\`\`bash
pnpm start
\`\`\`

## Health Check

\`\`\`bash
curl http://localhost:$port/healthz
\`\`\`

## Docker

\`\`\`bash
docker build -t $name .
docker run -p $port:$port $name
\`\`\`

---

*Generated by Mobius Service Generator - Cycle C-150*
EOF
  
  echo "✅ $name created successfully!"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SERVICE GENERATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Services processed:"
for service in "${SERVICES[@]}"; do
  IFS=':' read -r name type port <<< "$service"
  echo "  ✅ $name ($type:$port)"
done
echo ""
echo "Next steps:"
echo "  1. cd apps/ledger-api && pnpm install && pnpm dev"
echo "  2. Test health check: curl http://localhost:4001/healthz"
echo "  3. Repeat for other services"
echo "  4. Or use Docker: docker-compose -f infra/docker/compose.yml up"
echo ""

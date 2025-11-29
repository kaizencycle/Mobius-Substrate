# Mobius Ledger API - Python/FastAPI
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY civic-protocol-core/requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install uvicorn fastapi

# Copy application code
COPY civic-protocol-core/ ./civic-protocol-core/

# Create data and logs directories
RUN mkdir -p /app/data /app/logs

# Create non-root user
RUN useradd -m -u 1000 civic && \
    chown -R civic:civic /app

# Switch to non-root user
USER civic

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4001/healthz || exit 1

# Default command - run FastAPI ledger service
CMD ["uvicorn", "civic-protocol-core.ledger.app.main:app", "--host", "0.0.0.0", "--port", "4001"]

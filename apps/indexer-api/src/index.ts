// MIC Indexer API - C-151 Implementation
import express from 'express';
import cors from 'cors';
import cyclesRouter from './routes/cycles';
import pulseRouter from './routes/pulse';
import pulseV2Router from './routes/pulseV2';
import micRouter from './routes/mic';

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Allow larger payloads for pulses

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'indexer-api',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    cycle: 'C-151',
    features: ['mic', 'ks', 'mii', 'pulse']
  });
});

// Cycle routes (MCP v1.0)
app.use('/api', cyclesRouter);

// Pulse routes (Sentinel heartbeat protocol)
app.use('/api', pulseRouter);
// Pulse routes v2 (C-151 - with GI/MII scores)
app.use('/api', pulseV2Router);

// MIC routes (C-151 - Mobius Integrity Credits)
app.use('/api', micRouter);

// Legacy GIC endpoints (redirect to MIC for backward compatibility)
app.get('/gic/balance/:address', (req, res) => {
  res.redirect(`/api/v1/mic/balance/${req.params.address}`);
});

app.post('/gic/transactions', (req, res) => {
  // Legacy format - convert to MIC mint
  res.json({
    deprecated: true,
    message: 'Use /api/v1/mic/mint instead',
    id: `tx_${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString()
  });
});

app.get('/gic/transactions', (req, res) => {
  res.redirect('/api/v1/mic/transactions');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MIC Indexer API v2.0.0 running on port ${PORT}`);
  console.log(`📊 MIC/KS Economy: 1 MIC = 1,000,000 KS`);
  console.log(`🎯 MII Threshold: 0.95`);
});

export default app;



import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🧭 GI Aggregator running on :${PORT}`);
  console.log('   POST /gi/sample');
  console.log('   GET  /gi/spot');
  console.log('   GET  /gi/twa?days=30');
});


import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🏛️  Civic Ledger running on port ${PORT}`);
  console.log(`   GET  /health`);
  console.log(`   GET  /system/health`);
  console.log(`   GET  /gi`);
  console.log(`   POST /convert/shards-to-credits`);
  console.log(`   POST /convert/credits-to-shards`);
  console.log();
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   GI Warning Threshold: ${process.env.GI_FLOOR_WARN || '0.950'}`);
  console.log(`   GI Halt Threshold: ${process.env.GI_FLOOR_HALT || '0.900'}`);
});

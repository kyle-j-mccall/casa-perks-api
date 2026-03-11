import app from './src/app';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`CasaPerks API running on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  API base:     http://localhost:${PORT}/api`);
  console.log();
  console.log('  Default API key (dev): dev-secret-key');
  console.log('  Override via env: CASA_PERKS_API_KEY=<your-key>');
});

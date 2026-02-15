const { execSync } = require('child_process');

try {
  console.log('🔧 Génération du Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:REDACTED_DB_PASSWORD@localhost:5432/gps_financier?schema=public'
    }
  });
  console.log('✅ Prisma Client généré avec succès!');
} catch (error) {
  console.error('❌ Erreur lors de la génération:', error.message);
  process.exit(1);
}
// Script pour réinitialiser le mot de passe admin
// Usage: NEW_ADMIN_PASSWORD=MonNouveauMdp node scripts/reset-admin-password.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

async function run() {
  const newPassword = process.env.NEW_ADMIN_PASSWORD;
  if (!newPassword) {
    console.error('❌ Erreur: définir NEW_ADMIN_PASSWORD en variable d\'environnement');
    console.error('   Usage: NEW_ADMIN_PASSWORD=MonMdp node scripts/reset-admin-password.js');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await p.user.update({
    where: { email: process.env.ADMIN_EMAIL || 'jhon.desir@pl4to.com' },
    data: {
      password: hashedPassword,
      isAdmin: true,
      emailVerified: true
    }
  });

  console.log('✅ Mot de passe admin mis à jour avec succès');
  await p.$disconnect();
}

run();

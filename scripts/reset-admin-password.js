// Script pour réinitialiser le mot de passe admin
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

async function run() {
  const newPassword = 'REDACTED';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await p.user.update({
    where: { email: 'jhon.desir@pl4to.com' },
    data: {
      password: hashedPassword,
      isAdmin: true,
      emailVerified: true
    }
  });

  console.log('✅ Mot de passe mis à jour pour jhon.desir@pl4to.com');
  await p.$disconnect();
}

run();

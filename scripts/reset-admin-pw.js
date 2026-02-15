const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function reset() {
  const hash = await bcrypt.hash('REDACTED_PASSWORD', 10);
  await p.user.update({
    where: { email: 'jhon.desir@pl4to.com' },
    data: { password: hash }
  });
  console.log('Mot de passe reinitialise: REDACTED_PASSWORD');
  await p.$disconnect();
}

reset();
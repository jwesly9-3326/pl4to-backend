// Script rapide pour activer admin
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  await p.user.update({
    where: { email: 'jhon.desir@pl4to.com' },
    data: { 
      emailVerified: true, 
      verificationCode: null, 
      isAdmin: true 
    }
  });
  
  await p.user.updateMany({
    where: { 
      email: { not: 'jhon.desir@pl4to.com' }, 
      isAdmin: true 
    },
    data: { isAdmin: false }
  });
  
  console.log('✅ jhon.desir@pl4to.com = Admin + Email vérifié');
  await p.$disconnect();
}

run();

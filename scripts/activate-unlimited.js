// 🔓 Script d'activation accès illimité
// Usage: node scripts/activate-unlimited.js

require('dotenv').config();
const prisma = require('../prisma-client');

const UNLIMITED_EMAILS = [
  'jwesly9@gmail.com',
  'jhon.desir@pl4to.com'
];

async function main() {
  console.log('🔓 Activation accès illimité...');
  console.log('');
  
  for (const email of UNLIMITED_EMAILS) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, prenom: true, subscriptionPlan: true, unlimitedAccess: true }
      });
      
      if (!user) {
        console.log(`⚠️  ${email} — Utilisateur non trouvé`);
        
        // Essayer en minuscules
        const userLower = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, email: true, prenom: true, subscriptionPlan: true, unlimitedAccess: true }
        });
        
        if (userLower) {
          console.log(`   → Trouvé avec email: ${userLower.email}`);
          await prisma.user.update({
            where: { id: userLower.id },
            data: {
              unlimitedAccess: true,
              subscriptionPlan: 'pro',
              planChosen: true
            }
          });
          console.log(`   ✅ ${userLower.prenom} (${userLower.email}) — Accès illimité activé!`);
        } else {
          console.log(`   ❌ Aucun compte trouvé pour ${email}`);
        }
        continue;
      }
      
      if (user.unlimitedAccess && user.subscriptionPlan === 'pro') {
        console.log(`✅ ${user.prenom} (${email}) — Déjà activé (Pro+IA)`);
        continue;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          unlimitedAccess: true,
          subscriptionPlan: 'pro',
          planChosen: true
        }
      });
      
      console.log(`✅ ${user.prenom} (${email}) — Accès illimité activé!`);
    } catch (err) {
      console.error(`❌ Erreur pour ${email}:`, err.message);
    }
  }
  
  console.log('');
  console.log('🔓 Terminé! Ces comptes ont maintenant:');
  console.log('   - Plan Pro (toutes les fonctionnalités)');
  console.log('   - Pas de restrictions de trial');
  console.log('   - Pas de popup paiement');
  
  process.exit();
}

main();

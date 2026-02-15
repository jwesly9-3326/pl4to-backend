// Script pour corriger les dates du trial de jwesly9@gmail.com - ANNÉE 2026
const prisma = require('./prisma-client');

async function fixTrialDates() {
  const email = 'jwesly9@gmail.com';
  
  // Dates corrigées: 17 janvier 2026 → 31 janvier 2026 (14 jours)
  const trialStartDate = new Date('2026-01-17T00:00:00.000Z');
  const trialEndDate = new Date('2026-01-31T23:59:59.000Z');
  
  console.log(`\n🔧 Correction des dates pour: ${email}\n`);
  console.log(`   - Nouvelle date début: ${trialStartDate.toISOString().split('T')[0]}`);
  console.log(`   - Nouvelle date fin: ${trialEndDate.toISOString().split('T')[0]}`);
  
  try {
    // 1. Mettre à jour le TrialHistory
    await prisma.trialHistory.update({
      where: { email: email.toLowerCase() },
      data: {
        trialStartDate: trialStartDate,
        trialEndDate: trialEndDate
      }
    });
    console.log(`\n✅ TrialHistory mis à jour`);
    
    // 2. Récupérer le User
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (user) {
      // Calculer les jours restants
      const now = new Date();
      const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
      const trialActive = daysRemaining > 0;
      
      // 3. Mettre à jour le User
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          trialStartDate: trialStartDate,
          trialEndDate: trialEndDate,
          trialActive: trialActive,
          subscriptionPlan: trialActive ? 'essential' : 'discovery'
        }
      });
      
      // 4. Lier le TrialHistory au User
      await prisma.trialHistory.update({
        where: { email: email.toLowerCase() },
        data: { userId: user.id }
      });
      
      console.log(`✅ User mis à jour`);
      console.log(`\n📊 Résultat final:`);
      console.log(`   - trialStartDate: ${trialStartDate.toISOString().split('T')[0]}`);
      console.log(`   - trialEndDate: ${trialEndDate.toISOString().split('T')[0]}`);
      console.log(`   - trialActive: ${trialActive}`);
      console.log(`   - subscriptionPlan: ${updatedUser.subscriptionPlan}`);
      console.log(`   - Jours restants: ${daysRemaining}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixTrialDates();

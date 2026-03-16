// 🏠 SEED DEMO TEMPLATE - Crée le modèle de démonstration pour les conseillers
// Usage: node scripts/seed-demo-template.js <email-admin>
// Le template est un ClientProfile avec isTemplate=true que le conseiller peut cloner
// Données: Famille québécoise type (couple + 2 enfants, revenus médians, dépenses réalistes)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// DONNÉES DU MODÈLE DE DÉMONSTRATION
// Source: Statistique Canada, EDM 2023, Québec
// Revenus ménage médian QC: ~72 000$/an (couple 2 enfants)
// ============================================
const DEMO_TEMPLATE_SNAPSHOT = {
  userInfo: {
    prenom: 'Marc-Antoine',
    nom: 'Bergeron',
    situationFamiliale: 'couple_enfants',
    personnesCharge: 2
  },
  accounts: [
    { id: 'demo-tpl-chq', nom: 'Chèques Desjardins', type: 'checking' },
    { id: 'demo-tpl-ep', nom: 'Épargne CELI', type: 'savings' },
    { id: 'demo-tpl-reer', nom: 'REER Desjardins', type: 'savings' },
    { id: 'demo-tpl-cc', nom: 'Visa Desjardins', type: 'credit' }
  ],
  initialBalances: {
    dateDepart: new Date().toISOString().split('T')[0],
    soldes: [
      { accountName: 'Chèques Desjardins', accountType: 'checking', solde: 2850 },
      { accountName: 'Épargne CELI', accountType: 'savings', solde: 12400 },
      { accountName: 'REER Desjardins', accountType: 'savings', solde: 35000 },
      { accountName: 'Visa Desjardins', accountType: 'credit', solde: 3200 }
    ]
  },
  budgetPlanning: {
    entrees: [
      { id: 'tpl-e1', nom: 'Salaire Marc-Antoine', montant: 2750, frequence: 'bihebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 15 },
      { id: 'tpl-e2', nom: 'Salaire Isabelle', montant: 2200, frequence: 'bihebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 22 },
      { id: 'tpl-e3', nom: 'Allocations familiales (ACE)', montant: 580, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 20 }
    ],
    sorties: [
      // 🏠 Logement
      { id: 'tpl-s1', nom: 'Hypothèque', montant: 1650, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 'tpl-s2', nom: 'Taxes municipales + scolaires', montant: 375, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      // 💡 Services
      { id: 'tpl-s3', nom: 'Hydro-Québec', montant: 165, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 12 },
      { id: 'tpl-s4', nom: 'Internet + cellulaires', montant: 185, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 5 },
      // 🍎 Alimentation
      { id: 'tpl-s5', nom: 'Épicerie', montant: 225, frequence: 'hebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 1 },
      // 🚗 Transport
      { id: 'tpl-s6', nom: 'Paiement auto', montant: 450, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 15 },
      { id: 'tpl-s7', nom: 'Essence', montant: 260, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 'tpl-s8', nom: 'Assurance auto', montant: 125, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      // 👶 Enfants
      { id: 'tpl-s9', nom: 'Garderie (2 enfants)', montant: 380, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 'tpl-s10', nom: 'Activités enfants (soccer, natation)', montant: 120, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      // 🛡️ Assurances
      { id: 'tpl-s11', nom: 'Assurance habitation', montant: 95, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 'tpl-s12', nom: 'Assurance vie', montant: 65, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      // 🍽️ Restaurants & sorties
      { id: 'tpl-s13', nom: 'Restaurants et sorties', montant: 200, frequence: 'mensuel', compte: 'Visa Desjardins', jourDuMois: 1 },
      // 🎨 Loisirs
      { id: 'tpl-s14', nom: 'Netflix + Spotify', montant: 35, frequence: 'mensuel', compte: 'Visa Desjardins', jourDuMois: 1 },
      // 💊 Santé
      { id: 'tpl-s15', nom: 'Pharmacie / soins', montant: 80, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      // 💳 Dettes
      { id: 'tpl-s16', nom: 'Paiement minimum Visa', montant: 120, frequence: 'mensuel', compte: 'Visa Desjardins', jourDuMois: 25 },
      // 💰 Épargne
      { id: 'tpl-s17', nom: 'Virement CELI', montant: 200, frequence: 'mensuel', compte: 'Épargne CELI', jourDuMois: 1 },
      { id: 'tpl-s18', nom: 'Virement REER', montant: 150, frequence: 'mensuel', compte: 'REER Desjardins', jourDuMois: 1 }
    ]
  },
  financialGoals: [
    { id: 'tpl-g1', nom: 'Rembourser le Visa', montant: 3200, dateEcheance: '2026-12-31' },
    { id: 'tpl-g2', nom: 'Fonds d\'urgence (6 mois)', montant: 20000, dateEcheance: '2028-06-30' },
    { id: 'tpl-g3', nom: 'Voyage famille Mexique', montant: 6000, dateEcheance: '2027-03-01' },
    { id: 'tpl-g4', nom: 'Rénovation cuisine', montant: 15000, dateEcheance: '2029-01-01' }
  ]
};

async function seedDemoTemplate() {
  const adminEmail = process.argv[2];

  if (!adminEmail) {
    console.error('❌ Usage: node scripts/seed-demo-template.js <email-admin>');
    console.error('   Exemple: node scripts/seed-demo-template.js jhon@pl4to.com');
    process.exit(1);
  }

  console.log(`\n🏠 PL4TO — Seed Modèle de Démonstration`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  try {
    // 1. Trouver l'admin et son organisation
    const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!adminUser) {
      console.error(`❌ Utilisateur non trouvé: ${adminEmail}`);
      process.exit(1);
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: adminUser.id, isActive: true },
      include: { organization: true }
    });
    if (!membership) {
      console.error(`❌ Cet utilisateur n'a pas d'organisation. Exécutez d'abord seed-enterprise.js`);
      process.exit(1);
    }

    console.log(`✅ Organisation: ${membership.organization.name}`);
    console.log(`   Admin: ${adminUser.prenom} ${adminUser.nom}`);

    // 2. Vérifier si un template existe déjà
    const existingTemplate = await prisma.clientProfile.findFirst({
      where: { organizationId: membership.organization.id, isTemplate: true }
    });

    if (existingTemplate) {
      console.log(`\n⚠️  Un template existe déjà: ${existingTemplate.templateName || existingTemplate.prenom + ' ' + existingTemplate.nom}`);
      console.log(`   ID: ${existingTemplate.id}`);
      console.log(`\n💡 Pour recréer, supprimez d'abord le template existant.`);
      process.exit(0);
    }

    // 3. Créer le template
    const template = await prisma.clientProfile.create({
      data: {
        organizationId: membership.organization.id,
        advisorUserId: adminUser.id,
        prenom: 'Marc-Antoine',
        nom: 'Bergeron',
        email: 'demo@pl4to.com',
        phone: '514-555-0000',
        notes: '🏠 MODÈLE DE DÉMONSTRATION — Famille québécoise type (couple + 2 enfants). Utilisez ce profil pour montrer PL4TO à un client potentiel.',
        userDataSnapshot: DEMO_TEMPLATE_SNAPSHOT,
        isTemplate: true,
        templateName: 'Famille québécoise type',
        status: 'active'
      }
    });

    console.log(`\n✅ Modèle de démonstration créé!`);
    console.log(`   Nom: ${template.prenom} ${template.nom}`);
    console.log(`   Template: ${template.templateName}`);
    console.log(`   ID: ${template.id}`);

    // Résumé du profil
    const snap = DEMO_TEMPLATE_SNAPSHOT;
    const totalEntrees = snap.budgetPlanning.entrees.reduce((sum, e) => {
      if (e.frequence === 'bihebdomadaire') return sum + (e.montant * 26 / 12);
      if (e.frequence === 'hebdomadaire') return sum + (e.montant * 52 / 12);
      return sum + e.montant;
    }, 0);
    const totalSorties = snap.budgetPlanning.sorties.reduce((sum, s) => {
      if (s.frequence === 'hebdomadaire') return sum + (s.montant * 52 / 12);
      return sum + s.montant;
    }, 0);

    console.log(`\n📊 Résumé du profil:`);
    console.log(`   👤 ${snap.userInfo.prenom} ${snap.userInfo.nom} (${snap.userInfo.situationFamiliale})`);
    console.log(`   🏦 ${snap.accounts.length} comptes`);
    console.log(`   💵 Revenus: ~${Math.round(totalEntrees).toLocaleString('fr-CA')}$/mois`);
    console.log(`   💸 Dépenses: ~${Math.round(totalSorties).toLocaleString('fr-CA')}$/mois`);
    console.log(`   🎯 ${snap.financialGoals.length} objectifs financiers`);
    console.log(`   💰 Balance: ~${Math.round(totalEntrees - totalSorties)}$/mois`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎉 TEMPLATE PRÊT!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n📍 Le bouton "Charger la démo" dans le dashboard`);
    console.log(`   permettra de cloner ce template pour chaque présentation.\n`);

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoTemplate();

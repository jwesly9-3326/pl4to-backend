// 🏢 SEED ENTERPRISE - Script pour créer une organisation de test
// Usage: node scripts/seed-enterprise.js <email-admin>
// Exemple: node scripts/seed-enterprise.js jhon@pl4to.com

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedEnterprise() {
  const adminEmail = process.argv[2];
  
  if (!adminEmail) {
    console.error('❌ Usage: node scripts/seed-enterprise.js <email-admin>');
    console.error('   Exemple: node scripts/seed-enterprise.js jhon@pl4to.com');
    process.exit(1);
  }
  
  console.log(`\n🏢 PL4TO Entreprise - Seed Script`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  try {
    // 1. Trouver l'utilisateur admin
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!adminUser) {
      console.error(`❌ Utilisateur non trouvé: ${adminEmail}`);
      console.error(`   Assurez-vous qu'un compte existe avec cet email.`);
      process.exit(1);
    }
    
    console.log(`✅ Utilisateur trouvé: ${adminUser.prenom} ${adminUser.nom} (${adminUser.email})`);
    
    // 2. Vérifier si une organisation existe déjà pour cet utilisateur
    const existingMember = await prisma.organizationMember.findFirst({
      where: { userId: adminUser.id },
      include: { organization: true }
    });
    
    if (existingMember) {
      console.log(`\n⚠️  Cet utilisateur est déjà membre de: ${existingMember.organization.name}`);
      console.log(`   Rôle: ${existingMember.role}`);
      console.log(`   Organisation ID: ${existingMember.organization.id}`);
      console.log(`\n💡 Pour recréer, supprimez d'abord l'organisation existante.`);
      process.exit(0);
    }
    
    // 3. Créer l'organisation
    const orgName = `Cabinet de ${adminUser.prenom} ${adminUser.nom}`;
    const orgSlug = `cabinet-${adminUser.prenom?.toLowerCase() || 'test'}-${adminUser.nom?.toLowerCase() || 'test'}`.replace(/[^a-z0-9-]/g, '-');
    
    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug: orgSlug,
        contactEmail: adminUser.email,
        brandColor: '#040449',
        maxSeats: 5,
        isActive: true
      }
    });
    
    console.log(`\n✅ Organisation créée:`);
    console.log(`   Nom: ${organization.name}`);
    console.log(`   Slug: ${organization.slug}`);
    console.log(`   ID: ${organization.id}`);
    
    // 4. Ajouter l'utilisateur comme admin
    const membership = await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: adminUser.id,
        role: 'admin',
        title: 'Fondateur',
        joinedAt: new Date()
      }
    });
    
    console.log(`\n✅ Membership créé:`);
    console.log(`   Rôle: admin`);
    console.log(`   Titre: Fondateur`);
    
    // 5. Créer 3 clients de démonstration
    const demoClients = [
      {
        prenom: 'Marie-Claude',
        nom: 'Tremblay',
        email: 'mc.tremblay@demo.com',
        phone: '514-555-0101',
        notes: 'Cliente depuis 3 ans. Objectif: retraite à 58 ans. Préoccupée par les dépenses.',
        userDataSnapshot: {
          userInfo: {
            prenom: 'Marie-Claude',
            nom: 'Tremblay',
            situationFamiliale: 'couple_enfants',
            personnesCharge: 2
          },
          accounts: [
            { id: 'demo-chq-1', nom: 'Chèques Desjardins', type: 'checking' },
            { id: 'demo-ep-1', nom: 'Épargne CELI', type: 'savings' },
            { id: 'demo-cc-1', nom: 'Visa Desjardins', type: 'credit' }
          ],
          initialBalances: {
            dateDepart: new Date().toISOString().split('T')[0],
            soldes: [
              { accountName: 'Chèques Desjardins', accountType: 'checking', solde: 3250 },
              { accountName: 'Épargne CELI', accountType: 'savings', solde: 18500 },
              { accountName: 'Visa Desjardins', accountType: 'credit', solde: 2800 }
            ]
          },
          budgetPlanning: {
            entrees: [
              { id: 'e1', nom: 'Salaire', montant: 3800, frequence: 'bihebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 15 },
              { id: 'e2', nom: 'Allocations familiales', montant: 520, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 20 }
            ],
            sorties: [
              { id: 's1', nom: 'Hypothèque', montant: 1850, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
              { id: 's2', nom: 'Épicerie', montant: 250, frequence: 'hebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 1 },
              { id: 's3', nom: 'Garderie', montant: 950, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
              { id: 's4', nom: 'Auto + essence', montant: 650, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 15 },
              { id: 's5', nom: 'Paiement minimum Visa', montant: 120, frequence: 'mensuel', compte: 'Visa Desjardins', jourDuMois: 25 }
            ]
          },
          financialGoals: [
            { id: 'g1', nom: 'Rembourser Visa', montant: 2800, dateEcheance: '2026-06-01' },
            { id: 'g2', nom: 'Fonds urgence 6 mois', montant: 15000, dateEcheance: '2027-12-31' }
          ]
        }
      },
      {
        prenom: 'Jean-François',
        nom: 'Lavoie',
        email: 'jf.lavoie@demo.com',
        phone: '418-555-0202',
        notes: 'Nouveau client. Travailleur autonome, revenus irréguliers. Besoin de structure.',
        userDataSnapshot: {
          userInfo: {
            prenom: 'Jean-François',
            nom: 'Lavoie',
            situationFamiliale: 'celibataire',
            personnesCharge: 0
          },
          accounts: [
            { id: 'demo-chq-2', nom: 'Chèques BMO', type: 'checking' },
            { id: 'demo-ep-2', nom: 'REER BMO', type: 'savings' }
          ],
          initialBalances: {
            dateDepart: new Date().toISOString().split('T')[0],
            soldes: [
              { accountName: 'Chèques BMO', accountType: 'checking', solde: 5800 },
              { accountName: 'REER BMO', accountType: 'savings', solde: 42000 }
            ]
          },
          budgetPlanning: {
            entrees: [
              { id: 'e1', nom: 'Revenus consultation', montant: 6500, frequence: 'mensuel', compte: 'Chèques BMO', jourDuMois: 1 }
            ],
            sorties: [
              { id: 's1', nom: 'Loyer', montant: 1600, frequence: 'mensuel', compte: 'Chèques BMO', jourDuMois: 1 },
              { id: 's2', nom: 'Impôts provisionnels', montant: 1200, frequence: 'mensuel', compte: 'Chèques BMO', jourDuMois: 15 },
              { id: 's3', nom: 'Dépenses courantes', montant: 1800, frequence: 'mensuel', compte: 'Chèques BMO', jourDuMois: 1 }
            ]
          },
          financialGoals: []
        }
      },
      {
        prenom: 'Sophie',
        nom: 'Gagné',
        email: null,
        phone: '450-555-0303',
        notes: 'Référée par Marie-Claude. Situation post-divorce, besoin de restructurer.',
        userDataSnapshot: null // Pas encore de données — profil vierge
      }
    ];
    
    console.log(`\n📋 Création de ${demoClients.length} clients de démonstration...`);
    
    for (const clientData of demoClients) {
      const client = await prisma.clientProfile.create({
        data: {
          organizationId: organization.id,
          advisorUserId: adminUser.id,
          prenom: clientData.prenom,
          nom: clientData.nom,
          email: clientData.email,
          phone: clientData.phone,
          notes: clientData.notes,
          userDataSnapshot: clientData.userDataSnapshot,
          status: 'active'
        }
      });
      
      const hasData = clientData.userDataSnapshot ? '✅ avec données' : '📋 profil vierge';
      console.log(`   ✅ ${client.prenom} ${client.nom} (${hasData})`);
    }
    
    // 6. Mettre à jour le plan de l'utilisateur
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { subscriptionPlan: 'enterprise' }
    });
    
    console.log(`\n✅ Plan utilisateur mis à jour: enterprise`);
    
    // Résumé
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎉 SETUP TERMINÉ!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n📍 Pour tester:`);
    console.log(`   1. Connecte-toi avec ${adminEmail}`);
    console.log(`   2. Le lien "🏢 Mes clients" apparaît dans le sidebar`);
    console.log(`   3. Clique dessus pour voir le dashboard Enterprise`);
    console.log(`   4. Sélectionne un client → le GPS/Budget montrent SES données`);
    console.log(`   5. Le header affiche quel client est actif`);
    console.log(`   6. Clique ✕ pour revenir à tes données personnelles\n`);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedEnterprise();

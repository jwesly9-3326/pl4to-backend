// 🏠 PL4TO Demo Snapshot — Famille québécoise type (Marc-Antoine Bergeron)
// Used by: POST /api/enterprise/portal/demo/login
// Source: Statistique Canada, EDM 2023, Québec

const DEMO_SNAPSHOT = {
  userInfo: {
    prenom: 'Marc-Antoine',
    nom: 'Bergeron',
    situationFamiliale: 'couple_enfants',
    personnesCharge: 2
  },
  accounts: [
    { id: 'demo-chq', nom: 'Chèques Desjardins', type: 'checking' },
    { id: 'demo-ep', nom: 'Épargne CELI', type: 'savings' },
    { id: 'demo-reer', nom: 'REER Desjardins', type: 'savings' },
    { id: 'demo-cc', nom: 'Visa Desjardins', type: 'credit' }
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
      { id: 'e1', nom: 'Salaire Marc-Antoine', montant: 2750, frequence: 'bihebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 15 },
      { id: 'e2', nom: 'Salaire Isabelle', montant: 2200, frequence: 'bihebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 22 },
      { id: 'e3', nom: 'Allocations familiales (ACE)', montant: 580, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 20 }
    ],
    sorties: [
      { id: 's1', nom: 'Hypothèque', montant: 1650, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's2', nom: 'Taxes municipales + scolaires', montant: 375, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's3', nom: 'Hydro-Québec', montant: 165, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 12 },
      { id: 's4', nom: 'Internet + cellulaires', montant: 185, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 5 },
      { id: 's5', nom: 'Épicerie', montant: 225, frequence: 'hebdomadaire', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's6', nom: 'Paiement auto', montant: 450, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 15 },
      { id: 's7', nom: 'Essence', montant: 260, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's8', nom: 'Assurance auto', montant: 125, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's9', nom: 'Garderie (2 enfants)', montant: 380, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's10', nom: 'Activités enfants (soccer, natation)', montant: 120, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's11', nom: 'Assurance habitation', montant: 95, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's12', nom: 'Assurance vie', montant: 65, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's13', nom: 'Restaurants et sorties', montant: 200, frequence: 'mensuel', compte: 'Visa Desjardins', jourDuMois: 1 },
      { id: 's14', nom: 'Netflix + Spotify', montant: 35, frequence: 'mensuel', compte: 'Visa Desjardins', jourDuMois: 1 },
      { id: 's15', nom: 'Pharmacie / soins', montant: 80, frequence: 'mensuel', compte: 'Chèques Desjardins', jourDuMois: 1 },
      { id: 's16', nom: 'Paiement minimum Visa', montant: 120, frequence: 'mensuel', compte: 'Visa Desjardins', jourDuMois: 25 },
      { id: 's17', nom: 'Virement CELI', montant: 200, frequence: 'mensuel', compte: 'Épargne CELI', jourDuMois: 1 },
      { id: 's18', nom: 'Virement REER', montant: 150, frequence: 'mensuel', compte: 'REER Desjardins', jourDuMois: 1 }
    ]
  },
  financialGoals: [
    { id: 'g1', nom: 'Rembourser le Visa', montant: 3200, dateEcheance: '2026-12-31' },
    { id: 'g2', nom: "Fonds d'urgence (6 mois)", montant: 20000, dateEcheance: '2028-06-30' },
    { id: 'g3', nom: 'Voyage famille Mexique', montant: 6000, dateEcheance: '2027-03-01' },
    { id: 'g4', nom: 'Rénovation cuisine', montant: 15000, dateEcheance: '2029-01-01' }
  ]
};

module.exports = DEMO_SNAPSHOT;

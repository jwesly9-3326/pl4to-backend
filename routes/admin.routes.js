// 🔐 ROUTES ADMIN - Gestion des demandes d'optimisation PL4TO
// Workflow: Réception → Analyse → Proposition → Acceptation
// Accès: Admin uniquement (isAdmin: true)

const express = require('express');
const router = express.Router();
const prisma = require('../prisma-client');

// ============================================
// MIDDLEWARE: Vérification Admin
// ============================================
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, email: true }
    });
    
    if (!user || !user.isAdmin) {
      console.log(`[Admin] Accès refusé pour user ${userId}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux administrateurs' 
      });
    }
    
    req.adminEmail = user.email;
    next();
  } catch (error) {
    console.error('[Admin] Erreur vérification admin:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

// ============================================
// HELPER: Générer ID de demande unique PAR UTILISATEUR
// Format: OPT-USR1, OPT-USR2, etc. (numéro séquentiel par user)
// ============================================
const generateOptimizationId = async (userId) => {
// Compteur GLOBAL pour éviter les doublons
const totalRequests = await prisma.optimizationRequest.count();
let sequence = totalRequests + 1;
let requestId = `OPT-USR${sequence}`;
  
// Vérifier unicité (au cas où des suppressions créent des trous)
let exists = await prisma.optimizationRequest.findUnique({ where: { requestId } });
  while (exists) {
  sequence++;
    requestId = `OPT-USR${sequence}`;
    exists = await prisma.optimizationRequest.findUnique({ where: { requestId } });
  }
  
  return requestId;
};

// ============================================
// 1. CRÉER UNE DEMANDE (Utilisateur)
// POST /api/optimization-requests
// ============================================
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { allDayData } = req.body; // Données de trajectoire du frontend
    
    // Vérifier si l'utilisateur a déjà une demande en cours
    const existingRequest = await prisma.optimizationRequest.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'analyzing', 'proposal_ready'] }
      }
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'Vous avez déjà une demande en cours',
        existingRequestId: existingRequest.requestId
      });
    }
    
    // Récupérer les données utilisateur pour le snapshot
    const userData = await prisma.userData.findUnique({
      where: { userId }
    });
    
    if (!userData) {
      return res.status(400).json({
        success: false,
        error: 'Aucune donnée utilisateur trouvée. Complétez votre profil d\'abord.'
      });
    }
    
    // Créer le snapshot anonymisé (incluant allDayData si fourni)
    const dataSnapshot = {
      accounts: userData.accounts || [],
      initialBalances: userData.initialBalances || {},
      budgetPlanning: userData.budgetPlanning || {},
      financialGoals: userData.financialGoals || [],
      allDayData: allDayData || null, // Trajectoire calculée côté frontend
      snapshotDate: new Date().toISOString()
    };
    
    // Générer l'ID unique (par utilisateur)
    const requestId = await generateOptimizationId(userId);
    
    // Créer la demande
    const request = await prisma.optimizationRequest.create({
      data: {
        requestId,
        userId,
        status: 'pending',
        priority: 0,
        dataSnapshot
      }
    });
    
    console.log(`[Optimization] Nouvelle demande créée: ${requestId} pour user ${userId}`);
    
    res.status(201).json({
      success: true,
      message: 'Demande d\'optimisation envoyée avec succès',
      requestId: request.requestId,
      status: request.status,
      createdAt: request.createdAt
    });
    
  } catch (error) {
    console.error('[Optimization] Erreur création demande:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la demande' });
  }
});

// ============================================
// 2. RÉCUPÉRER MES DEMANDES (Utilisateur)
// GET /api/optimization-requests/my-requests
// ============================================
router.get('/my-requests', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const requests = await prisma.optimizationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        requestId: true,
        status: true,
        priority: true,
        proposalMessage: true,
        proposedChanges: true,
        projectedImpact: true,
        userResponse: true,
        userFeedback: true,
        createdAt: true,
        proposalCreatedAt: true,
        completedAt: true
      }
    });
    
    res.json({ success: true, requests });
    
  } catch (error) {
    console.error('[Optimization] Erreur récupération mes demandes:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 3. RÉCUPÉRER MA DEMANDE ACTIVE (Utilisateur)
// GET /api/optimization-requests/active
// ============================================
router.get('/active', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activeRequest = await prisma.optimizationRequest.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'analyzing', 'proposal_ready'] }
      },
      select: {
        id: true,
        requestId: true,
        status: true,
        priority: true,
        proposalMessage: true,
        proposedChanges: true,
        projectedImpact: true,
        createdAt: true,
        proposalCreatedAt: true
      }
    });
    
    res.json({ 
      success: true, 
      hasActiveRequest: !!activeRequest,
      request: activeRequest 
    });
    
  } catch (error) {
    console.error('[Optimization] Erreur récupération demande active:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 4. RÉPONDRE À UNE PROPOSITION (Utilisateur)
// PUT /api/optimization-requests/:requestId/respond
// ============================================
router.put('/:requestId/respond', async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { response, feedback } = req.body; // response: 'accepted' | 'rejected'
    
    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({
        success: false,
        error: 'Réponse invalide. Utilisez "accepted" ou "rejected".'
      });
    }
    
    // Trouver la demande
    const request = await prisma.optimizationRequest.findFirst({
      where: {
        requestId,
        userId,
        status: 'proposal_ready'
      }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée ou pas de proposition en attente'
      });
    }
    
    // Mettre à jour avec la réponse
    const updatedRequest = await prisma.optimizationRequest.update({
      where: { id: request.id },
      data: {
        status: response,
        userResponse: response,
        userFeedback: feedback || null,
        userResponseAt: new Date(),
        completedAt: new Date()
      }
    });
    
    // Si accepté, AJOUTER les budgetModifications (NE PAS modifier les budgets de base!)
    if (response === 'accepted' && request.proposedChanges) {
      console.log(`[Optimization] ========================================`);
      console.log(`[Optimization] TRAITEMENT ACCEPTATION pour ${requestId}`);
      console.log(`[Optimization] ========================================`);
      
      // Récupérer les données utilisateur
      const userData = await prisma.userData.findUnique({
        where: { userId }
      });
      
      if (userData) {
        const proposedChanges = request.proposedChanges;
        let newModifications = proposedChanges.modifications || [];
        const recommendations = proposedChanges.recommendations || [];
        
        console.log(`[Optimization] ${newModifications.length} modification(s) OPE brutes`);
        console.log(`[Optimization] ${recommendations.length} recommandation(s) disponibles`);
        
        // ✅ Si modifications vides MAIS recommendations existent → les convertir
        // GPSFinancier a besoin de modifications avec entrees/sorties snapshots complets
        if (newModifications.length === 0 && recommendations.length > 0) {
          console.log(`[Optimization] 🔄 Conversion recommendations → modifications...`);
          
          const baseEntrees = userData.budgetPlanning?.entrees || [];
          const baseSorties = userData.budgetPlanning?.sorties || [];
          
          // Trier par date d'intervention (plus ancienne d'abord)
          const sortedRecs = [...recommendations].sort((a, b) => 
            (a.interventionDate || '').localeCompare(b.interventionDate || '')
          );
          
          // Construire les modifications cumulatives (chaque mod inclut TOUS les changements précédents)
          let currentEntrees = baseEntrees.map(e => ({ ...e }));
          let currentSorties = baseSorties.map(s => ({ ...s }));
          
          sortedRecs.forEach(rec => {
            // Appliquer le changement sur le budget cumulé
            currentEntrees = currentEntrees.map(entree => {
              if (entree.description === rec.budgetDescription && 
                  entree.compte === rec.accountName) {
                return { ...entree, montant: rec.newAmount };
              }
              return { ...entree };
            });
            
            currentSorties = currentSorties.map(s => ({ ...s }));
            
            newModifications.push({
              id: `OPE-MOD-${rec.id}`,
              dateEffet: rec.interventionDate,
              description: `OPE-1: Réduction paiement ${rec.accountName}`,
              source: 'OPE-1',
              recommendationId: rec.id,
              entrees: currentEntrees.map(e => ({ ...e })),
              sorties: currentSorties.map(s => ({ ...s })),
              meta: {
                accountName: rec.accountName,
                previousAmount: rec.currentAmount,
                newAmount: rec.newAmount,
                frequence: rec.frequence,
                monthlyRecovery: rec.monthlyRecovery
              }
            });
            
            console.log(`[Optimization] ✅ Modification générée: ${rec.accountName} ${rec.currentAmount}→${rec.newAmount} @ ${rec.interventionDate}`);
          });
          
          console.log(`[Optimization] 🔄 ${newModifications.length} modification(s) générées depuis recommendations`);
        }
        
        if (newModifications.length > 0) {
          // ✅ RÉCUPÉRER les modifications existantes (NE PAS ÉCRASER)
          const existingModifications = userData.budgetPlanning?.modifications || [];
          console.log(`[Optimization] ${existingModifications.length} modification(s) existantes`);
          
          // ✅ FUSIONNER: anciennes + nouvelles
          const allModifications = [...existingModifications, ...newModifications];
          
          const updatedBudgetPlanning = {
            ...userData.budgetPlanning,
            modifications: allModifications,
            lastOptimizationApplied: requestId,
            lastModifiedAt: new Date().toISOString(),
            optimizationHistory: [
              ...(userData.budgetPlanning?.optimizationHistory || []),
              {
                requestId: requestId,
                appliedAt: new Date().toISOString(),
                modificationsCount: newModifications.length,
                recommendations: recommendations.map(rec => ({
                  accountName: rec.accountName,
                  oldAmount: rec.currentAmount,
                  newAmount: rec.newAmount,
                  interventionDate: rec.interventionDate,
                  monthlyRecovery: rec.monthlyRecovery
                })),
                projectedImpact: request.projectedImpact
              }
            ]
          };
          
          await prisma.userData.update({
            where: { userId },
            data: { budgetPlanning: updatedBudgetPlanning }
          });
          
          console.log(`[Optimization] ✅ ${newModifications.length} modification(s) ajoutées!`);
          console.log(`[Optimization] ✅ Total modifications: ${allModifications.length}`);
        } else {
          console.log(`[Optimization] ❌ Aucune modification ni recommendation à appliquer`);
        }
      } else {
        console.log(`[Optimization] ❌ userData non trouvé pour userId ${userId}`);
      }
    }
    
    console.log(`[Optimization] Réponse utilisateur pour ${requestId}: ${response}`);
    
    res.json({
      success: true,
      message: response === 'accepted' 
        ? 'Optimisation acceptée et appliquée à votre budget!' 
        : 'Proposition refusée',
      status: updatedRequest.status
    });
    
  } catch (error) {
    console.error('[Optimization] Erreur réponse utilisateur:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 5. ANNULER MA DEMANDE (Utilisateur)
// DELETE /api/optimization-requests/:requestId
// ============================================
router.delete('/:requestId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    
    const request = await prisma.optimizationRequest.findFirst({
      where: {
        requestId,
        userId,
        status: { in: ['pending', 'analyzing'] } // Seulement si pas encore de proposition
      }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée ou ne peut plus être annulée'
      });
    }
    
    await prisma.optimizationRequest.update({
      where: { id: request.id },
      data: {
        status: 'cancelled',
        completedAt: new Date()
      }
    });
    
    console.log(`[Optimization] Demande annulée: ${requestId}`);
    
    res.json({ success: true, message: 'Demande annulée' });
    
  } catch (error) {
    console.error('[Optimization] Erreur annulation:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// ============================================
// ROUTES ADMIN (requireAdmin middleware)
// ============================================
// ============================================

// ============================================
// 6. LISTE TOUTES LES DEMANDES (Admin)
// GET /api/optimization-requests/admin/all
// ============================================
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', sortOrder = 'asc' } = req.query;
    
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const requests = await prisma.optimizationRequest.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        requestId: true,
        status: true,
        priority: true,
        proposalMessage: true,
        projectedImpact: true,
        userResponse: true,
        userFeedback: true,
        createdAt: true,
        proposalCreatedAt: true,
        userResponseAt: true,
        completedAt: true,
        // EXCLURE: dataSnapshot, proposedChanges, analysisNotes (trop lourd pour la liste)
        user: {
          select: {
            id: true
          }
        }
      }
    });
    
    // Stats globales
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      analyzing: requests.filter(r => r.status === 'analyzing').length,
      proposalReady: requests.filter(r => r.status === 'proposal_ready').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length
    };
    
    res.json({ success: true, requests, stats });
    
  } catch (error) {
    console.error('[Admin] Erreur liste demandes:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 7. STATS DASHBOARD (Admin) - Doit être AVANT /:requestId
// GET /api/optimization-requests/admin/dashboard/stats
// ============================================
router.get('/admin/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    // Stats globales
    const [
      totalRequests,
      pendingRequests,
      analyzingRequests,
      proposalReadyRequests,
      acceptedRequests,
      rejectedRequests
    ] = await Promise.all([
      prisma.optimizationRequest.count(),
      prisma.optimizationRequest.count({ where: { status: 'pending' } }),
      prisma.optimizationRequest.count({ where: { status: 'analyzing' } }),
      prisma.optimizationRequest.count({ where: { status: 'proposal_ready' } }),
      prisma.optimizationRequest.count({ where: { status: 'accepted' } }),
      prisma.optimizationRequest.count({ where: { status: 'rejected' } })
    ]);
    
    // Demandes récentes (7 derniers jours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentRequests = await prisma.optimizationRequest.count({
      where: {
        createdAt: { gte: weekAgo }
      }
    });
    
    // Temps moyen de traitement (demandes complétées)
    const completedRequests = await prisma.optimizationRequest.findMany({
      where: {
        completedAt: { not: null },
        status: { in: ['accepted', 'rejected'] }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });
    
    let avgProcessingTime = 0;
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, req) => {
        return sum + (req.completedAt.getTime() - req.createdAt.getTime());
      }, 0);
      avgProcessingTime = Math.round(totalTime / completedRequests.length / (1000 * 60 * 60)); // En heures
    }
    
    // Taux d'acceptation
    const acceptanceRate = (acceptedRequests + rejectedRequests) > 0 
      ? Math.round((acceptedRequests / (acceptedRequests + rejectedRequests)) * 100)
      : 0;
    
    res.json({
      success: true,
      stats: {
        total: totalRequests,
        pending: pendingRequests,
        analyzing: analyzingRequests,
        proposalReady: proposalReadyRequests,
        accepted: acceptedRequests,
        rejected: rejectedRequests,
        recentRequests,
        avgProcessingTimeHours: avgProcessingTime,
        acceptanceRate
      }
    });
    
  } catch (error) {
    console.error('[Admin] Erreur stats dashboard:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 8. DÉTAILS D'UNE DEMANDE (Admin)
// GET /api/optimization-requests/admin/:requestId
// ============================================
router.get('/admin/:requestId', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await prisma.optimizationRequest.findUnique({
      where: { requestId }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }
    
    res.json({ success: true, request });
    
  } catch (error) {
    console.error('[Admin] Erreur détails demande:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 9. RÉCUPÉRER DONNÉES FRAÎCHES UTILISATEUR (Admin)
// GET /api/optimization-requests/admin/:requestId/fresh-data
// Pour comparer avec le snapshot et détecter les changements
// ============================================
router.get('/admin/:requestId/fresh-data', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await prisma.optimizationRequest.findUnique({
      where: { requestId }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }
    
    // Récupérer les données actuelles de l'utilisateur
    const currentUserData = await prisma.userData.findUnique({
      where: { userId: request.userId }
    });
    
    // Comparer avec le snapshot (SANS snapshotDate pour éviter faux positifs)
    const snapshot = request.dataSnapshot;
    const current = currentUserData || {};
    
    // Créer objets de comparaison SANS snapshotDate
    const snapshotToCompare = {
      accounts: JSON.stringify(snapshot.accounts || []),
      initialBalances: JSON.stringify(snapshot.initialBalances || {}),
      budgetPlanning: JSON.stringify(snapshot.budgetPlanning || {}),
      financialGoals: JSON.stringify(snapshot.financialGoals || [])
    };
    
    const currentToCompare = {
      accounts: JSON.stringify(current.accounts || []),
      initialBalances: JSON.stringify(current.initialBalances || {}),
      budgetPlanning: JSON.stringify(current.budgetPlanning || {}),
      financialGoals: JSON.stringify(current.financialGoals || [])
    };
    
    // Comparer chaque section
    const hasChanges = 
      snapshotToCompare.accounts !== currentToCompare.accounts ||
      snapshotToCompare.initialBalances !== currentToCompare.initialBalances ||
      snapshotToCompare.budgetPlanning !== currentToCompare.budgetPlanning ||
      snapshotToCompare.financialGoals !== currentToCompare.financialGoals;
    
    console.log('[Admin] Comparaison snapshot vs current:', {
      accountsMatch: snapshotToCompare.accounts === currentToCompare.accounts,
      balancesMatch: snapshotToCompare.initialBalances === currentToCompare.initialBalances,
      budgetMatch: snapshotToCompare.budgetPlanning === currentToCompare.budgetPlanning,
      goalsMatch: snapshotToCompare.financialGoals === currentToCompare.financialGoals,
      hasChanges
    });
    
    res.json({
      success: true,
      snapshot: request.dataSnapshot,
      currentData: currentUserData ? {
        accounts: currentUserData.accounts,
        initialBalances: currentUserData.initialBalances,
        budgetPlanning: currentUserData.budgetPlanning,
        financialGoals: currentUserData.financialGoals
      } : null,
      hasChanges,
      requestId
    });
    
  } catch (error) {
    console.error('[Admin] Erreur récupération données fraîches:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 10. METTRE À JOUR LE SNAPSHOT (Admin)
// PUT /api/optimization-requests/admin/:requestId/refresh-snapshot
// ============================================
router.put('/admin/:requestId/refresh-snapshot', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await prisma.optimizationRequest.findUnique({
      where: { requestId }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }
    
    // Récupérer les données actuelles
    const currentUserData = await prisma.userData.findUnique({
      where: { userId: request.userId }
    });
    
    if (!currentUserData) {
      return res.status(400).json({
        success: false,
        error: 'Données utilisateur non trouvées'
      });
    }
    
    // Créer nouveau snapshot (conserver allDayData existant)
    const newSnapshot = {
      accounts: currentUserData.accounts || [],
      initialBalances: currentUserData.initialBalances || {},
      budgetPlanning: currentUserData.budgetPlanning || {},
      financialGoals: currentUserData.financialGoals || [],
      allDayData: request.dataSnapshot?.allDayData || null, // Conserver allDayData existant
      snapshotDate: new Date().toISOString()
    };
    
    // Mettre à jour
    await prisma.optimizationRequest.update({
      where: { requestId },
      data: { dataSnapshot: newSnapshot }
    });
    
    console.log(`[Admin] Snapshot mis à jour pour ${requestId}`);
    
    res.json({
      success: true,
      message: 'Snapshot mis à jour avec les données actuelles',
      newSnapshot
    });
    
  } catch (error) {
    console.error('[Admin] Erreur refresh snapshot:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 11. COMMENCER L'ANALYSE (Admin)
// PUT /api/optimization-requests/admin/:requestId/start-analysis
// ============================================
router.put('/admin/:requestId/start-analysis', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await prisma.optimizationRequest.findUnique({
      where: { requestId }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cette demande n\'est plus en attente'
      });
    }
    
    const updatedRequest = await prisma.optimizationRequest.update({
      where: { requestId },
      data: {
        status: 'analyzing',
        analysisStartedAt: new Date()
      }
    });
    
    console.log(`[Admin] Analyse commencée pour ${requestId}`);
    
    res.json({
      success: true,
      message: 'Analyse commencée',
      request: updatedRequest
    });
    
  } catch (error) {
    console.error('[Admin] Erreur début analyse:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 12. SAUVEGARDER RÉSULTATS ANALYSE (Admin)
// PUT /api/optimization-requests/admin/:requestId/save-analysis
// ============================================
router.put('/admin/:requestId/save-analysis', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { imbalances, trajectoryIssues, analysisNotes } = req.body;
    
    const request = await prisma.optimizationRequest.findUnique({
      where: { requestId }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }
    
    const updatedRequest = await prisma.optimizationRequest.update({
      where: { requestId },
      data: {
        imbalances: imbalances || null,
        trajectoryIssues: trajectoryIssues || null,
        analysisNotes: analysisNotes || null
      }
    });
    
    console.log(`[Admin] Résultats analyse sauvegardés pour ${requestId}`);
    
    res.json({
      success: true,
      message: 'Résultats d\'analyse sauvegardés',
      request: updatedRequest
    });
    
  } catch (error) {
    console.error('[Admin] Erreur sauvegarde analyse:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 13. CRÉER ET ENVOYER PROPOSITION (Admin)
// PUT /api/optimization-requests/admin/:requestId/send-proposal
// ============================================
router.put('/admin/:requestId/send-proposal', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { proposalMessage, proposedChanges, projectedImpact } = req.body;
    
    if (!proposalMessage || !proposedChanges) {
      return res.status(400).json({
        success: false,
        error: 'Message et modifications proposées requis'
      });
    }
    
    const request = await prisma.optimizationRequest.findUnique({
      where: { requestId }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }
    
    if (!['pending', 'analyzing'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cette demande ne peut pas recevoir de proposition'
      });
    }
    
    const updatedRequest = await prisma.optimizationRequest.update({
      where: { requestId },
      data: {
        status: 'proposal_ready',
        proposalMessage,
        proposedChanges,
        projectedImpact: projectedImpact || null,
        proposalCreatedAt: new Date()
      }
    });
    
    console.log(`[Admin] Proposition envoyée pour ${requestId}`);
    
    // TODO: Envoyer notification/email à l'utilisateur
    
    res.json({
      success: true,
      message: 'Proposition envoyée à l\'utilisateur',
      request: updatedRequest
    });
    
  } catch (error) {
    console.error('[Admin] Erreur envoi proposition:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 14. VÉRIFIER SI ADMIN (Public)
// GET /api/optimization-requests/check-admin
// ============================================
router.get('/check-admin', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });
    
    res.json({ 
      success: true, 
      isAdmin: user?.isAdmin || false 
    });
    
  } catch (error) {
    console.error('[Admin] Erreur check admin:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================
// 15. SUPPRIMER UNE DEMANDE (Admin)
// DELETE /api/optimization-requests/admin/:requestId
// ============================================
router.delete('/admin/:requestId', requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await prisma.optimizationRequest.findUnique({
      where: { requestId }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }
    
    // Récupérer le userId pour nettoyer ses données
    const userId = request.userId;
    
    // Supprimer la demande
    await prisma.optimizationRequest.delete({
      where: { requestId }
    });
    
    // Nettoyer l'état optimizationRequest dans userData de l'utilisateur
    try {
      const userData = await prisma.userData.findUnique({
        where: { userId }
      });
      
      if (userData && userData.optimizationRequest) {
        // Supprimer seulement si c'est la même demande
        const userOptReq = userData.optimizationRequest;
        if (userOptReq.requestId === requestId || userOptReq.requested) {
          await prisma.userData.update({
            where: { userId },
            data: { optimizationRequest: {} }
          });
          console.log(`[Admin] optimizationRequest nettoyé pour user ${userId}`);
        }
      }
    } catch (cleanupError) {
      console.error('[Admin] Erreur nettoyage userData:', cleanupError);
      // Ne pas bloquer la suppression même si le nettoyage échoue
    }
    
    console.log(`[Admin] Demande supprimée: ${requestId}`);
    
    res.json({
      success: true,
      message: 'Demande supprimée avec succès'
    });
    
  } catch (error) {
    console.error('[Admin] Erreur suppression demande:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;

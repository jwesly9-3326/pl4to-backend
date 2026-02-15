/**
 * GPS Financier - Backend Routes pour Budget Segments
 * 
 * INSTRUCTIONS D'INTÉGRATION:
 * 1. Copier le fichier budgetSegmentCalculator.js dans ton dossier backend
 * 2. Ajouter ces routes dans server.js après les routes existantes
 * 
 * Chemin suggéré: C:\Users\jwesl\pl4to-backend\utils\budgetSegmentCalculator.js
 */

// ============================================================
// AJOUT EN HAUT DE server.js (après les autres require)
// ============================================================

const {
  calculateSegmentMaxDate,
  generateAllSegments,
  generateSegmentsBatch,
  formatDateStr,
  parseLocalDate
} = require('./utils/budgetSegmentCalculator');


// ============================================================
// NOUVELLES ROUTES À AJOUTER DANS server.js
// ============================================================

/**
 * POST /api/budget-segments/generate
 * 
 * Génère automatiquement tous les segments budgétaires jusqu'à 2079
 * basé sur le budget de l'utilisateur (Segment 0 = userData.budgetPlanning)
 */
app.post('/api/budget-segments/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetYear = 2079, batchSize } = req.body;
    
    // 1. Récupérer les données utilisateur (budget de base = Segment 0)
    const userData = await prisma.userData.findUnique({
      where: { userId }
    });
    
    if (!userData || !userData.budgetPlanning) {
      return res.status(400).json({ 
        error: 'Aucun budget trouvé. Veuillez d\'abord configurer votre budget.' 
      });
    }
    
    const budgetPlanning = userData.budgetPlanning;
    const baseEntrees = budgetPlanning.entrees || [];
    const baseSorties = budgetPlanning.sorties || [];
    
    if (baseEntrees.length === 0 && baseSorties.length === 0) {
      return res.status(400).json({ 
        error: 'Votre budget est vide. Ajoutez des entrées et sorties avant de générer les segments.' 
      });
    }
    
    // 2. Supprimer les segments existants pour cet utilisateur
    await prisma.budgetSegment.deleteMany({
      where: { userId }
    });
    
    // 3. Générer les nouveaux segments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let segments;
    if (batchSize) {
      // Mode batch: générer un nombre limité de segments
      segments = generateSegmentsBatch(baseEntrees, baseSorties, today, batchSize);
    } else {
      // Mode complet: générer jusqu'à l'année cible
      segments = generateAllSegments(baseEntrees, baseSorties, today, targetYear);
    }
    
    // 4. Sauvegarder dans la base de données
    const createdSegments = [];
    
    for (const segment of segments) {
      const created = await prisma.budgetSegment.create({
        data: {
          userId,
          segmentIndex: segment.segmentIndex,
          name: `Segment ${segment.segmentIndex}`,
          startDate: new Date(segment.startDate),
          endDate: segment.endDate ? new Date(segment.endDate) : null,
          entrees: segment.entrees,
          sorties: segment.sorties,
          isBase: segment.isBase,
          copiedFrom: segment.copiedFrom
        }
      });
      createdSegments.push(created);
    }
    
    console.log(`[Budget Segments] Generated ${createdSegments.length} segments for user ${userId}`);
    
    res.json({
      success: true,
      message: `${createdSegments.length} segments générés avec succès`,
      segmentCount: createdSegments.length,
      firstSegment: createdSegments[0] ? {
        startDate: createdSegments[0].startDate,
        endDate: createdSegments[0].endDate
      } : null,
      lastSegment: createdSegments[createdSegments.length - 1] ? {
        startDate: createdSegments[createdSegments.length - 1].startDate,
        endDate: createdSegments[createdSegments.length - 1].endDate
      } : null
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error generating segments:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des segments', details: error.message });
  }
});


/**
 * POST /api/budget-segments/generate-next
 * 
 * Génère le prochain segment à partir du dernier segment existant
 * Utile pour l'extension progressive
 */
app.post('/api/budget-segments/generate-next', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 1. Trouver le dernier segment existant
    const lastSegment = await prisma.budgetSegment.findFirst({
      where: { userId },
      orderBy: { segmentIndex: 'desc' }
    });
    
    // 2. Récupérer le budget de base si pas de segment existant
    const userData = await prisma.userData.findUnique({
      where: { userId }
    });
    
    let baseEntrees, baseSorties, startDate, nextIndex;
    
    if (lastSegment) {
      // Utiliser le budget du dernier segment
      baseEntrees = lastSegment.entrees || [];
      baseSorties = lastSegment.sorties || [];
      // Commencer le jour après la fin du dernier segment
      startDate = new Date(lastSegment.endDate);
      startDate.setDate(startDate.getDate() + 1);
      nextIndex = lastSegment.segmentIndex + 1;
    } else {
      // Premier segment: utiliser le budget de base
      if (!userData || !userData.budgetPlanning) {
        return res.status(400).json({ error: 'Aucun budget trouvé.' });
      }
      baseEntrees = userData.budgetPlanning.entrees || [];
      baseSorties = userData.budgetPlanning.sorties || [];
      startDate = new Date();
      nextIndex = 1;
    }
    
    // 3. Calculer la DATE MAX pour le nouveau segment
    const result = calculateSegmentMaxDate(baseEntrees, baseSorties, startDate, 12);
    
    // 4. Créer le nouveau segment
    const newSegment = await prisma.budgetSegment.create({
      data: {
        userId,
        segmentIndex: nextIndex,
        name: `Segment ${nextIndex}`,
        startDate: startDate,
        endDate: new Date(result.maxDateStr),
        entrees: baseEntrees,
        sorties: baseSorties,
        isBase: false,
        copiedFrom: nextIndex === 1 ? 0 : nextIndex - 1
      }
    });
    
    res.json({
      success: true,
      segment: newSegment,
      calculatedMaxDate: result.maxDateStr
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error generating next segment:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du segment', details: error.message });
  }
});


/**
 * GET /api/budget-segments/calculate-preview
 * 
 * Prévisualise ce que serait la DATE MAX sans créer de segment
 * Utile pour le debugging et l'affichage UI
 */
app.get('/api/budget-segments/calculate-preview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fromDate } = req.query;
    
    const userData = await prisma.userData.findUnique({
      where: { userId }
    });
    
    if (!userData || !userData.budgetPlanning) {
      return res.status(400).json({ error: 'Aucun budget trouvé.' });
    }
    
    const baseEntrees = userData.budgetPlanning.entrees || [];
    const baseSorties = userData.budgetPlanning.sorties || [];
    const startDate = fromDate ? new Date(fromDate) : new Date();
    
    const result = calculateSegmentMaxDate(baseEntrees, baseSorties, startDate, 12);
    
    // Calculer aussi les 5 prochains segments pour preview
    const previewSegments = generateSegmentsBatch(baseEntrees, baseSorties, startDate, 5);
    
    res.json({
      referenceDate: formatDateStr(startDate),
      calculatedMaxDate: result.maxDateStr,
      totalDatesCalculated: result.allDates.length,
      uniqueDates: [...new Set(result.allDates.map(d => formatDateStr(d)))].sort(),
      previewSegments: previewSegments.map(s => ({
        index: s.segmentIndex,
        startDate: s.startDate,
        endDate: s.endDate
      }))
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error calculating preview:', error);
    res.status(500).json({ error: 'Erreur lors du calcul', details: error.message });
  }
});


/**
 * PUT /api/budget-segments/:segmentIndex/cascade
 * 
 * Modifie un segment ET réinitialise tous les segments suivants
 * (cascade: les segments N+1, N+2... sont copiés depuis N)
 */
app.put('/api/budget-segments/:segmentIndex/cascade', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const segmentIndex = parseInt(req.params.segmentIndex);
    const { entrees, sorties } = req.body;
    
    // 1. Mettre à jour le segment modifié
    const updatedSegment = await prisma.budgetSegment.update({
      where: {
        userId_segmentIndex: { userId, segmentIndex }
      },
      data: {
        entrees: entrees,
        sorties: sorties,
        updatedAt: new Date()
      }
    });
    
    // 2. Supprimer tous les segments après celui-ci
    await prisma.budgetSegment.deleteMany({
      where: {
        userId,
        segmentIndex: { gt: segmentIndex }
      }
    });
    
    // 3. Régénérer les segments suivants à partir du segment modifié
    const startDate = new Date(updatedSegment.endDate);
    startDate.setDate(startDate.getDate() + 1);
    
    // Générer jusqu'à 2079
    const newSegments = generateAllSegments(entrees, sorties, startDate, 2079);
    
    // Ajuster les index des nouveaux segments
    const adjustedSegments = newSegments.map((seg, idx) => ({
      ...seg,
      segmentIndex: segmentIndex + idx + 1,
      copiedFrom: segmentIndex + idx
    }));
    
    // 4. Sauvegarder les nouveaux segments
    for (const segment of adjustedSegments) {
      await prisma.budgetSegment.create({
        data: {
          userId,
          segmentIndex: segment.segmentIndex,
          name: `Segment ${segment.segmentIndex}`,
          startDate: new Date(segment.startDate),
          endDate: segment.endDate ? new Date(segment.endDate) : null,
          entrees: segment.entrees,
          sorties: segment.sorties,
          isBase: false,
          copiedFrom: segment.copiedFrom
        }
      });
    }
    
    res.json({
      success: true,
      message: `Segment ${segmentIndex} modifié et ${adjustedSegments.length} segments régénérés`,
      modifiedSegment: updatedSegment,
      regeneratedCount: adjustedSegments.length
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error cascading update:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour en cascade', details: error.message });
  }
});


/**
 * DELETE /api/budget-segments/clear
 * 
 * Supprime tous les segments d'un utilisateur
 * (utile pour réinitialiser)
 */
app.delete('/api/budget-segments/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const deleted = await prisma.budgetSegment.deleteMany({
      where: { userId }
    });
    
    res.json({
      success: true,
      message: `${deleted.count} segments supprimés`
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error clearing segments:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression', details: error.message });
  }
});


/**
 * GET /api/budget-segments/stats
 * 
 * Retourne des statistiques sur les segments générés
 */
app.get('/api/budget-segments/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const segments = await prisma.budgetSegment.findMany({
      where: { userId },
      orderBy: { segmentIndex: 'asc' }
    });
    
    if (segments.length === 0) {
      return res.json({
        hasSegments: false,
        count: 0,
        message: 'Aucun segment généré. Utilisez POST /api/budget-segments/generate pour créer les segments.'
      });
    }
    
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    
    // Calculer la durée moyenne d'un segment
    let totalDays = 0;
    segments.forEach(seg => {
      if (seg.startDate && seg.endDate) {
        const diff = new Date(seg.endDate) - new Date(seg.startDate);
        totalDays += diff / (1000 * 60 * 60 * 24);
      }
    });
    const avgDays = Math.round(totalDays / segments.length);
    
    res.json({
      hasSegments: true,
      count: segments.length,
      firstSegmentStart: firstSegment.startDate,
      lastSegmentEnd: lastSegment.endDate,
      averageDaysPerSegment: avgDays,
      coverage: {
        from: formatDateStr(new Date(firstSegment.startDate)),
        to: formatDateStr(new Date(lastSegment.endDate))
      }
    });
    
  } catch (error) {
    console.error('[Budget Segments] Error getting stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stats', details: error.message });
  }
});

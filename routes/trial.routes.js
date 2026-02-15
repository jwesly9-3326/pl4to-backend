// ============================================
// 🔔 ROUTES TRIAL REMINDERS
// Gestion des rappels pour le trial de 14 jours
// ============================================

const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  
  // ============================================
  // GET /api/trial/status
  // Récupérer le statut des rappels trial
  // ============================================
  router.get('/status', async (req, res) => {
    try {
      const userId = req.user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          trialStartDate: true,
          trialEndDate: true,
          trialActive: true,
          planChosen: true,
          trialWelcomeShown: true,
          trialReminder7DaysAt: true,
          trialReminder2DaysShown: true,
          trialRemindersStopped: true,
          subscriptionPlan: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      // Calculer les jours restants
      let daysRemaining = null;
      if (user.trialEndDate) {
        const now = new Date();
        const endDate = new Date(user.trialEndDate);
        daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) daysRemaining = 0;
      }
      
      // Déterminer quel popup afficher
      let showPopup = null;
      
      // Si rappels désactivés (plan choisi) ou pas de trial actif
      if (user.trialRemindersStopped || user.planChosen || !user.trialActive) {
        showPopup = null;
      }
      // Rappel 2 jours avant fin (priorité haute)
      else if (daysRemaining !== null && daysRemaining <= 2 && !user.trialReminder2DaysShown) {
        showPopup = 'reminder_2days';
      }
      // Rappel 7 jours (si date atteinte)
      else if (user.trialReminder7DaysAt) {
        const now = new Date();
        const reminderDate = new Date(user.trialReminder7DaysAt);
        if (now >= reminderDate) {
          showPopup = 'reminder_7days';
        }
      }
      // Popup initial (jamais vu)
      else if (!user.trialWelcomeShown) {
        showPopup = 'welcome';
      }
      
      console.log(`[🔔 Trial] Status pour user ${userId}: showPopup=${showPopup}, daysRemaining=${daysRemaining}`);
      
      res.json({
        success: true,
        trial: {
          startDate: user.trialStartDate,
          endDate: user.trialEndDate,
          active: user.trialActive,
          daysRemaining,
          planChosen: user.planChosen,
          subscriptionPlan: user.subscriptionPlan
        },
        reminders: {
          welcomeShown: user.trialWelcomeShown,
          reminder7DaysAt: user.trialReminder7DaysAt,
          reminder2DaysShown: user.trialReminder2DaysShown,
          stopped: user.trialRemindersStopped
        },
        showPopup
      });
      
    } catch (error) {
      console.error('[❌ Trial] Erreur get status:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du statut trial' });
    }
  });

  // ============================================
  // POST /api/trial/action
  // Enregistrer une action utilisateur
  // ============================================
  router.post('/action', async (req, res) => {
    try {
      const userId = req.user.id;
      const { action } = req.body;
      
      // Actions possibles:
      // - 'welcome_shown': Popup initial affiché
      // - 'ignore': Utilisateur a cliqué "Ignorer"
      // - 'remind_7days': Utilisateur veut un rappel dans 7 jours
      // - 'remind_7days_shown': Le rappel 7 jours a été affiché
      // - 'remind_2days_shown': Le rappel 2 jours a été affiché
      // - 'plan_chosen': Utilisateur a choisi un plan
      
      if (!action) {
        return res.status(400).json({ error: 'Action requise' });
      }
      
      let updateData = {};
      
      switch (action) {
        case 'welcome_shown':
          // Marquer le popup initial comme vu
          updateData.trialWelcomeShown = true;
          break;
          
        case 'ignore':
          // Utilisateur a cliqué "Ignorer" - marquer comme vu
          // ET programmer un rappel automatique dans 7 jours
          const autoRemindDate = new Date();
          autoRemindDate.setDate(autoRemindDate.getDate() + 7);
          updateData.trialWelcomeShown = true;
          updateData.trialReminder7DaysAt = autoRemindDate;
          console.log(`[🔔 Trial] Ignorer cliqué - rappel auto programmé pour ${autoRemindDate.toISOString()}`);
          break;
          
        case 'remind_7days':
          // Programmer un rappel dans 7 jours
          const remindDate = new Date();
          remindDate.setDate(remindDate.getDate() + 7);
          updateData.trialWelcomeShown = true;
          updateData.trialReminder7DaysAt = remindDate;
          console.log(`[🔔 Trial] Rappel 7 jours programmé pour ${remindDate.toISOString()}`);
          break;
          
        case 'remind_7days_shown':
          // Le rappel 7 jours a été affiché, reset la date
          updateData.trialReminder7DaysAt = null;
          break;
          
        case 'remind_2days_shown':
          // Marquer le rappel 2 jours comme affiché
          updateData.trialReminder2DaysShown = true;
          break;
          
        case 'plan_chosen':
          // Utilisateur a choisi un plan - désactiver tous les rappels
          updateData.trialRemindersStopped = true;
          updateData.planChosen = true;
          console.log(`[✅ Trial] Plan choisi par user ${userId}, rappels désactivés`);
          break;
          
        default:
          return res.status(400).json({ error: `Action non reconnue: ${action}` });
      }
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          trialWelcomeShown: true,
          trialReminder7DaysAt: true,
          trialReminder2DaysShown: true,
          trialRemindersStopped: true,
          planChosen: true
        }
      });
      
      console.log(`[🔔 Trial] Action '${action}' enregistrée pour user ${userId}`);
      
      res.json({
        success: true,
        message: `Action '${action}' enregistrée`,
        reminders: updatedUser
      });
      
    } catch (error) {
      console.error('[❌ Trial] Erreur action:', error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'action' });
    }
  });

  return router;
};

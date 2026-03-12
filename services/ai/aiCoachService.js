// ============================================
// 🤖 AI COACH SERVICE - Coach financier "Coach O"
// PL4TO - Recommandations personnalisées via Claude
// ============================================

const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../../prisma-client');

class AICoachService {
  constructor() {
    this.client = null;
    this.model = 'claude-sonnet-4-20250514';
    this.maxTokens = 2000;
    this.temperature = 0.7;
  }

  // Lazy init pour éviter crash si clé manquante au démarrage
  getClient() {
    if (!this.client) {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY non configurée');
      }
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this.client;
  }

  // ============================================
  // MÉMOIRE: Récupérer les snapshots récents
  // ============================================
  async getRecentSnapshots(userId, limit = 8) {
    try {
      const snapshots = await prisma.weeklyReportSnapshot.findMany({
        where: { userId },
        orderBy: { snapshotDate: 'desc' },
        take: limit,
        select: {
          weekStart: true,
          snapshotDate: true,
          financialSnapshot: true,
          comparativeInsights: true
        }
      });

      return snapshots.reverse(); // Chronologique: ancien → récent
    } catch (err) {
      console.error('[AICoach] Erreur récupération snapshots:', err.message);
      return [];
    }
  }

  // ============================================
  // MÉMOIRE: Construire le contexte historique
  // ============================================
  buildHistoryContext(snapshots, language = 'fr') {
    if (!snapshots || snapshots.length === 0) return null;

    const isFr = language === 'fr';

    // Construire le tableau d'évolution
    const evolution = snapshots.map(snap => {
      const s = typeof snap.financialSnapshot === 'string'
        ? JSON.parse(snap.financialSnapshot) : snap.financialSnapshot;
      if (!s || !s.portefeuille) return null;

      const row = {
        week: snap.weekStart,
        netWorth: s.portefeuille.valeurNette,
        assets: s.portefeuille.totalActifs,
        debts: s.portefeuille.totalDettes,
        budgetBalance: s.budget?.balanceMensuelle || null,
        budgetStatus: s.budget?.status || null,
        alertsCount: s.trajectoire6mois?.alertes?.length || 0,
        goals: (s.objectifs || []).map(g => ({
          name: g.nom,
          progress: g.progress,
          reached: g.isReached
        }))
      };
      return row;
    }).filter(Boolean);

    if (evolution.length === 0) return null;

    // Calculer les tendances globales
    const first = evolution[0];
    const last = evolution[evolution.length - 1];
    const netWorthDelta = last.netWorth - first.netWorth;
    const weekCount = evolution.length;

    // Construire le texte
    if (isFr) {
      let ctx = `\nHISTORIQUE FINANCIER (${weekCount} dernière${weekCount > 1 ? 's' : ''} semaine${weekCount > 1 ? 's' : ''}):\n`;

      ctx += `\nÉvolution semaine par semaine:\n`;
      ctx += `| Semaine | Valeur nette | Actifs | Dettes | Balance budget | Alertes |\n`;
      evolution.forEach(e => {
        ctx += `| ${e.week} | ${e.netWorth.toLocaleString()} $ | ${e.assets.toLocaleString()} $ | ${e.debts.toLocaleString()} $ | ${e.budgetBalance !== null ? e.budgetBalance.toLocaleString() + ' $' : 'N/A'} | ${e.alertsCount} |\n`;
      });

      ctx += `\nTendance sur ${weekCount} semaine${weekCount > 1 ? 's' : ''}: valeur nette ${netWorthDelta >= 0 ? '+' : ''}${netWorthDelta.toLocaleString()} $ (${netWorthDelta >= 0 ? 'en amélioration' : 'en déclin'})`;

      // Évolution des objectifs
      const latestGoals = last.goals;
      const firstGoals = first.goals;
      if (latestGoals.length > 0) {
        ctx += `\n\nProgression des objectifs:\n`;
        latestGoals.forEach(goal => {
          const prev = firstGoals.find(g => g.name === goal.name);
          if (prev) {
            const delta = goal.progress - prev.progress;
            ctx += `- ${goal.name}: ${prev.progress}% → ${goal.progress}% (${delta >= 0 ? '+' : ''}${delta} pts sur ${weekCount} sem.)${goal.reached ? ' ✅ ATTEINT' : ''}\n`;
          } else {
            ctx += `- ${goal.name}: ${goal.progress}% (nouveau)${goal.reached ? ' ✅ ATTEINT' : ''}\n`;
          }
        });
      }

      // Alertes récentes
      const latestAlerts = last.alertsCount;
      const firstAlerts = first.alertsCount;
      if (latestAlerts > 0 || firstAlerts > 0) {
        ctx += `\nAlertes trajectoire: ${firstAlerts} → ${latestAlerts} (${latestAlerts < firstAlerts ? 'amélioration' : latestAlerts > firstAlerts ? 'détérioration' : 'stable'})`;
      }

      return ctx;
    }

    // EN
    let ctx = `\nFINANCIAL HISTORY (last ${weekCount} week${weekCount > 1 ? 's' : ''}):\n`;

    ctx += `\nWeek-over-week evolution:\n`;
    ctx += `| Week | Net Worth | Assets | Debts | Budget Balance | Alerts |\n`;
    evolution.forEach(e => {
      ctx += `| ${e.week} | $${e.netWorth.toLocaleString()} | $${e.assets.toLocaleString()} | $${e.debts.toLocaleString()} | ${e.budgetBalance !== null ? '$' + e.budgetBalance.toLocaleString() : 'N/A'} | ${e.alertsCount} |\n`;
    });

    ctx += `\nTrend over ${weekCount} week${weekCount > 1 ? 's' : ''}: net worth ${netWorthDelta >= 0 ? '+' : ''}$${netWorthDelta.toLocaleString()} (${netWorthDelta >= 0 ? 'improving' : 'declining'})`;

    const latestGoals = last.goals;
    const firstGoals = first.goals;
    if (latestGoals.length > 0) {
      ctx += `\n\nGoals progress:\n`;
      latestGoals.forEach(goal => {
        const prev = firstGoals.find(g => g.name === goal.name);
        if (prev) {
          const delta = goal.progress - prev.progress;
          ctx += `- ${goal.name}: ${prev.progress}% → ${goal.progress}% (${delta >= 0 ? '+' : ''}${delta} pts over ${weekCount} wk)${goal.reached ? ' ✅ REACHED' : ''}\n`;
        } else {
          ctx += `- ${goal.name}: ${goal.progress}% (new)${goal.reached ? ' ✅ REACHED' : ''}\n`;
        }
      });
    }

    const latestAlerts = last.alertsCount;
    const firstAlerts = first.alertsCount;
    if (latestAlerts > 0 || firstAlerts > 0) {
      ctx += `\nTrajectory alerts: ${firstAlerts} → ${latestAlerts} (${latestAlerts < firstAlerts ? 'improving' : latestAlerts > firstAlerts ? 'worsening' : 'stable'})`;
    }

    return ctx;
  }

  // ============================================
  // SYSTEM PROMPT - Persona de Coach O
  // ============================================
  getSystemPrompt(language = 'fr') {
    if (language === 'en') {
      return `You are Coach O, the AI financial coach integrated into PL4TO, a personal financial GPS app.

PERSONALITY:
- Friendly, professional, encouraging
- You address the user informally ("you" in a warm, casual way)
- You are a GPS coach: the user has a financial position (today) and destinations (goals)
- You speak with clarity and precision, always actionable
- Use a suggestive, encouraging tone: prefer "you could", "I'd suggest", "it would be great to" rather than "you must", "you need to", "you have to"

RULES:
- NEVER give specific investment advice (no stock picks, no specific funds)
- NEVER promise specific returns or guarantees
- ALWAYS quantify impact when possible (e.g., "+$15K over 10 years")
- ALWAYS suggest concrete, actionable steps
- Maximum 5 recommendations, prioritized by impact
- Focus on what the user CAN control: budget, debt repayment, savings habits
- RESPECT the user's untouchable expenses — NEVER recommend reducing or eliminating those items
- PRIORITIZE recommendations based on the user's declared primary goal
- ADAPT recommendations to the chosen time horizon

FINANCIAL HISTORY (if provided):
- You may receive a FINANCIAL HISTORY section showing the user's week-over-week evolution
- Use this data to identify TRENDS: is their net worth improving or declining? Are goals progressing?
- Reference specific progress in your message (e.g., "Your net worth has grown +$1,200 over the past 4 weeks — great momentum!")
- If goals have stagnated, suggest adjustments. If they progressed well, congratulate and suggest next steps.
- If trajectory alerts are increasing, flag it as a concern. If decreasing, congratulate the improvement.
- If no history is available (first-time user), give general recommendations based on current data only.

RESPONSE FORMAT (strict JSON):
{
  "message": "A 2-3 sentence personalized greeting analyzing their overall situation",
  "recommendations": [
    {
      "title": "Short action title",
      "description": "2-3 sentences explaining the recommendation and why it matters",
      "impact": "Quantified impact (e.g., '+$500/month', '-$12K interest saved')",
      "priority": "high|medium|low",
      "category": "savings|debt|budget|goals"
    }
  ],
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no text before or after the JSON.`;
    }

    return `Tu es Coach O, le coach financier IA intégré dans PL4TO, une application GPS financier personnel.

PERSONNALITÉ:
- Amical, professionnel, encourageant
- Tu tutoies l'utilisateur naturellement (québécois familier mais respectueux)
- Tu es un coach GPS: l'utilisateur a une position financière (aujourd'hui) et des destinations (objectifs)
- Tu parles avec clarté et précision, toujours actionnable
- Utilise un ton suggestif et bienveillant: préfère "il faudrait", "tu pourrais", "je te suggère" plutôt que "on doit", "il faut", "tu dois"

RÈGLES:
- JAMAIS donner de conseils d'investissement spécifiques (pas de titres, pas de fonds précis)
- JAMAIS promettre des rendements ou des garanties
- TOUJOURS quantifier l'impact quand possible (ex: "+15 000$ sur 10 ans")
- TOUJOURS suggérer des étapes concrètes et actionnables
- Maximum 5 recommandations, priorisées par impact
- Focus sur ce que l'utilisateur PEUT contrôler: budget, remboursement dette, habitudes d'épargne
- RESPECTE les dépenses intouchables de l'utilisateur — ne recommande JAMAIS de réduire ces postes
- PRIORISE les recommandations selon l'objectif principal déclaré par l'utilisateur
- ADAPTE tes recommandations à l'horizon de temps choisi

HISTORIQUE FINANCIER (si disponible):
- Tu peux recevoir une section HISTORIQUE FINANCIER montrant l'évolution semaine par semaine
- Utilise ces données pour identifier les TENDANCES: la valeur nette s'améliore ou décline? Les objectifs progressent?
- Référence des progrès spécifiques dans ton message (ex: "Ta valeur nette a augmenté de +1 200$ ces 4 dernières semaines — belle progression!")
- Si des objectifs stagnent, suggère des ajustements. S'ils progressent bien, félicite et suggère les prochaines étapes.
- Si les alertes trajectoire augmentent, signale-le comme une préoccupation. Si elles diminuent, félicite l'amélioration.
- Si aucun historique n'est disponible (nouvel utilisateur), donne des recommandations générales basées sur les données actuelles uniquement.

FORMAT DE RÉPONSE (JSON strict):
{
  "message": "Une salutation personnalisée de 2-3 phrases analysant la situation globale",
  "recommendations": [
    {
      "title": "Titre court de l'action",
      "description": "2-3 phrases expliquant la recommandation et pourquoi c'est important",
      "impact": "Impact quantifié (ex: '+500$/mois', '-12 000$ d'intérêts économisés')",
      "priority": "high|medium|low",
      "category": "savings|debt|budget|goals"
    }
  ],
  "nextSteps": ["Étape 1", "Étape 2", "Étape 3"]
}

IMPORTANT: Réponds UNIQUEMENT avec du JSON valide. Pas de markdown, pas de texte avant ou après le JSON.`;
  }

  // ============================================
  // CONSTRUCTION DU PROMPT UTILISATEUR
  // ============================================
  buildUserPrompt(financialSummary, language = 'fr', userPreferences = {}, historyContext = null) {
    const s = financialSummary;
    const prefs = userPreferences;

    // Mapper les clés d'objectif vers du texte lisible
    const goalLabels = {
      en: { debt: 'Pay off debts faster', savings: 'Save more money', budget: 'Optimize monthly budget', income: 'Increase income', goal: 'Reach a specific financial goal' },
      fr: { debt: 'Rembourser ses dettes plus vite', savings: 'Épargner davantage', budget: 'Optimiser son budget mensuel', income: 'Augmenter ses revenus', goal: 'Atteindre un objectif financier spécifique' }
    };
    const horizonLabels = {
      en: { short: 'Short term (0-6 months)', medium: 'Medium term (6 months - 2 years)', long: 'Long term (2-5 years)' },
      fr: { short: 'Court terme (0-6 mois)', medium: 'Moyen terme (6 mois - 2 ans)', long: 'Long terme (2-5 ans)' }
    };

    if (language === 'en') {
      let prompt = `Here is my current financial situation:

ACCOUNTS:
${s.accounts.map(a => `- ${a.name} (${a.type}): $${a.balance.toLocaleString()}${a.interestRate ? ` @ ${a.interestRate}%` : ''}${a.limit ? ` (limit: $${a.limit.toLocaleString()})` : ''}`).join('\n')}

SUMMARY:
- Total assets: $${s.totals.assets.toLocaleString()}
- Total debts: $${s.totals.debts.toLocaleString()}
- Net worth: $${s.totals.netWorth.toLocaleString()}

MONTHLY INCOME ($${s.monthlyIncome.total.toLocaleString()}/month):
${s.monthlyIncome.items.map(i => `- ${i.desc}: $${i.amount.toLocaleString()}`).join('\n')}

MONTHLY EXPENSES ($${s.monthlyExpenses.total.toLocaleString()}/month):
${s.monthlyExpenses.items.map(i => `- ${i.desc}: $${i.amount.toLocaleString()}`).join('\n')}

MONTHLY CASHFLOW: $${s.monthlyCashflow.toLocaleString()}
SAVINGS RATE: ${s.trends.savingsRate}%

FINANCIAL GOALS:
${s.goals.length > 0 ? s.goals.map(g => `- ${g.name} (${g.account}): target $${g.target.toLocaleString()}, current $${g.current.toLocaleString()}, ${g.progress}% achieved`).join('\n') : 'No goals set yet'}

TRENDS:
- Net worth direction: ${s.trends.netWorthDirection}`;

      // Ajouter la suggestion d'épargne si disponible
      if (s.savingsSuggestion) {
        if (s.savingsSuggestion.isDeficit) {
          prompt += `\n\nSAVINGS SUGGESTION:
- Monthly budget is in DEFICIT ($${Math.abs(s.savingsSuggestion.surplus).toLocaleString()}/month)
- ${s.savingsSuggestion.activeGoals} active goal(s) out of ${s.savingsSuggestion.totalGoals} total
- The user CANNOT save towards their goals without adjusting their budget first`;
        } else {
          prompt += `\n\nSAVINGS SUGGESTION (shown to user on their Goals page):
- Monthly surplus: $${s.savingsSuggestion.surplus.toLocaleString()}/month
- Suggested savings per goal: $${s.savingsSuggestion.perGoal.toLocaleString()}/month (spread across ${s.savingsSuggestion.activeGoals} active goal${s.savingsSuggestion.activeGoals > 1 ? 's' : ''})
- Use this data to make concrete recommendations about savings allocation`;
        }
      }

      // Ajouter les préférences utilisateur si présentes
      if (prefs.primaryGoal || (prefs.untouchableExpenses && prefs.untouchableExpenses.length > 0) || prefs.timeHorizon) {
        prompt += `\n\nUSER PREFERENCES:`;
        if (prefs.primaryGoal) {
          prompt += `\n- Primary goal: ${goalLabels.en[prefs.primaryGoal] || prefs.primaryGoal}`;
        }
        if (prefs.untouchableExpenses && prefs.untouchableExpenses.length > 0) {
          prompt += `\n- Untouchable expenses (DO NOT recommend reducing these): ${prefs.untouchableExpenses.join(', ')}`;
        }
        if (prefs.timeHorizon) {
          prompt += `\n- Time horizon: ${horizonLabels.en[prefs.timeHorizon] || prefs.timeHorizon}`;
        }
        prompt += `\n\nIMPORTANT: Absolutely respect the expenses marked as untouchable. NEVER recommend reducing or eliminating those items. Focus your recommendations on the user's primary goal and time horizon.`;
      }

      if (historyContext) {
        prompt += `\n${historyContext}`;
      }

      prompt += `\n\nBased on this data${historyContext ? ' and my financial history' : ''}, what are your personalized recommendations to improve my financial trajectory?`;
      return prompt;
    }

    let prompt = `Voici ma situation financière actuelle:

COMPTES:
${s.accounts.map(a => `- ${a.name} (${a.type}): ${a.balance.toLocaleString()} $${a.interestRate ? ` @ ${a.interestRate}%` : ''}${a.limit ? ` (limite: ${a.limit.toLocaleString()} $)` : ''}`).join('\n')}

SOMMAIRE:
- Actifs totaux: ${s.totals.assets.toLocaleString()} $
- Dettes totales: ${s.totals.debts.toLocaleString()} $
- Valeur nette: ${s.totals.netWorth.toLocaleString()} $

REVENUS MENSUELS (${s.monthlyIncome.total.toLocaleString()} $/mois):
${s.monthlyIncome.items.map(i => `- ${i.desc}: ${i.amount.toLocaleString()} $`).join('\n')}

DÉPENSES MENSUELLES (${s.monthlyExpenses.total.toLocaleString()} $/mois):
${s.monthlyExpenses.items.map(i => `- ${i.desc}: ${i.amount.toLocaleString()} $`).join('\n')}

CASHFLOW MENSUEL: ${s.monthlyCashflow.toLocaleString()} $
TAUX D'ÉPARGNE: ${s.trends.savingsRate}%

OBJECTIFS FINANCIERS:
${s.goals.length > 0 ? s.goals.map(g => `- ${g.name} (${g.account}): cible ${g.target.toLocaleString()} $, actuel ${g.current.toLocaleString()} $, ${g.progress}% atteint`).join('\n') : 'Aucun objectif configuré'}

TENDANCES:
- Direction valeur nette: ${s.trends.netWorthDirection === 'improving' ? 'en amélioration' : s.trends.netWorthDirection === 'declining' ? 'en déclin' : 'stable'}`;

    // Ajouter la suggestion d'épargne si disponible
    if (s.savingsSuggestion) {
      if (s.savingsSuggestion.isDeficit) {
        prompt += `\n\nSUGGESTION D'ÉPARGNE:
- Le budget mensuel est en DÉFICIT (${Math.abs(s.savingsSuggestion.surplus).toLocaleString()} $/mois)
- ${s.savingsSuggestion.activeGoals} objectif(s) actif(s) sur ${s.savingsSuggestion.totalGoals} au total
- L'utilisateur NE PEUT PAS épargner vers ses objectifs sans ajuster son budget d'abord`;
      } else {
        prompt += `\n\nSUGGESTION D'ÉPARGNE (affichée à l'utilisateur sur sa page Objectifs):
- Surplus mensuel: ${s.savingsSuggestion.surplus.toLocaleString()} $/mois
- Épargne suggérée par objectif: ${s.savingsSuggestion.perGoal.toLocaleString()} $/mois (répartie sur ${s.savingsSuggestion.activeGoals} objectif${s.savingsSuggestion.activeGoals > 1 ? 's' : ''} actif${s.savingsSuggestion.activeGoals > 1 ? 's' : ''})
- Utilise ces données pour faire des recommandations concrètes sur l'allocation de l'épargne`;
      }
    }

    // Ajouter les préférences utilisateur si présentes
    if (prefs.primaryGoal || (prefs.untouchableExpenses && prefs.untouchableExpenses.length > 0) || prefs.timeHorizon) {
      prompt += `\n\nPRÉFÉRENCES DE L'UTILISATEUR:`;
      if (prefs.primaryGoal) {
        prompt += `\n- Objectif principal: ${goalLabels.fr[prefs.primaryGoal] || prefs.primaryGoal}`;
      }
      if (prefs.untouchableExpenses && prefs.untouchableExpenses.length > 0) {
        prompt += `\n- Dépenses intouchables (NE PAS recommander de réduire): ${prefs.untouchableExpenses.join(', ')}`;
      }
      if (prefs.timeHorizon) {
        prompt += `\n- Horizon de temps: ${horizonLabels.fr[prefs.timeHorizon] || prefs.timeHorizon}`;
      }
      prompt += `\n\nIMPORTANT: Respecte absolument les dépenses marquées comme intouchables. Ne recommande JAMAIS de réduire ou éliminer ces postes. Concentre tes recommandations sur l'objectif principal de l'utilisateur et son horizon de temps.`;
    }

    if (historyContext) {
      prompt += `\n${historyContext}`;
    }

    prompt += `\n\nEn te basant sur ces données${historyContext ? ' et mon historique financier' : ''}, quelles sont tes recommandations personnalisées pour améliorer ma trajectoire financière?`;
    return prompt;
  }

  // ============================================
  // MÉTHODE PRINCIPALE: Obtenir des recommandations
  // ============================================
  async getRecommendations(userId, financialSummary, language = 'fr', userPreferences = {}) {
    console.log(`[AICoach] Génération recommandations pour user ${userId} (langue: ${language}, prefs: ${JSON.stringify(userPreferences).substring(0, 100)})`);

    const client = this.getClient();

    // 📸 Récupérer l'historique des snapshots pour le contexte
    let historyContext = null;
    try {
      const snapshots = await this.getRecentSnapshots(userId, 8);
      if (snapshots.length > 0) {
        historyContext = this.buildHistoryContext(snapshots, language);
        console.log(`[AICoach] 📸 ${snapshots.length} snapshots chargés pour contexte historique`);
      } else {
        console.log(`[AICoach] 📸 Aucun snapshot disponible (premier usage)`);
      }
    } catch (histErr) {
      console.error('[AICoach] ⚠️ Erreur chargement historique, continuing without:', histErr.message);
    }

    try {
      const response = await client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: this.getSystemPrompt(language),
        messages: [
          {
            role: 'user',
            content: this.buildUserPrompt(financialSummary, language, userPreferences, historyContext)
          }
        ]
      });

      // Extraire le texte de la réponse
      const responseText = response.content[0].text.trim();
      console.log(`[AICoach] Réponse reçue (${responseText.length} chars) pour user ${userId}`);

      // Parser le JSON
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseError) {
        // Tentative: extraire JSON d'un bloc markdown si Claude l'a wrappé
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1].trim());
        } else {
          // Tentative: trouver le premier { et le dernier }
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            parsed = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
          } else {
            console.error('[AICoach] Impossible de parser la réponse JSON:', responseText.substring(0, 200));
            throw new Error('Format de réponse invalide');
          }
        }
      }

      // Validation de la structure
      if (!parsed.message || !Array.isArray(parsed.recommendations)) {
        console.error('[AICoach] Structure JSON invalide:', Object.keys(parsed));
        throw new Error('Structure de recommandation invalide');
      }

      // Limiter à 5 recommandations max
      if (parsed.recommendations.length > 5) {
        parsed.recommendations = parsed.recommendations.slice(0, 5);
      }

      // S'assurer que nextSteps existe
      if (!Array.isArray(parsed.nextSteps)) {
        parsed.nextSteps = [];
      }

      console.log(`[AICoach] ${parsed.recommendations.length} recommandations générées pour user ${userId}`);

      return {
        message: parsed.message,
        recommendations: parsed.recommendations.map(rec => ({
          title: rec.title || '',
          description: rec.description || '',
          impact: rec.impact || '',
          priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
          category: ['savings', 'debt', 'budget', 'goals'].includes(rec.category) ? rec.category : 'budget'
        })),
        nextSteps: parsed.nextSteps.slice(0, 3),
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0
        }
      };
    } catch (error) {
      console.error('[AICoach] Erreur Anthropic API:', error.message);

      // Erreurs spécifiques
      if (error.status === 429) {
        throw new Error('Limite de requêtes API atteinte. Réessayez dans quelques minutes.');
      }
      if (error.status === 401) {
        throw new Error('Clé API Anthropic invalide.');
      }

      throw error;
    }
  }
}

module.exports = new AICoachService();

// 📧 PL4TO - Template Résumé Hebdomadaire (FR + EN)
// Version 2: Confidentialité + Teaser pour engagement
// Sections: Calendrier, Budget (status), Objectifs (%), Alertes (teaser)

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pl4to.com';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * 💡 Coach PL4TO — génère des messages motivationnels basés sur l'état du rapport
 * Retourne max 2 messages pour ne pas surcharger l'email
 */
function getCoachingMessage(report, lang) {
  const messages = [];
  const isFr = lang === 'fr';

  // 1. Coaching basé sur la valeur nette (comparisons.valeurNetteChange)
  const netChange = report.comparisons?.valeurNetteChange;
  if (typeof netChange === 'number') {
    if (netChange > 0) {
      messages.push(isFr
        ? `🚀 Ta valeur nette a grimpé de ${Math.abs(netChange).toLocaleString('fr-CA')} $ cette semaine. Continue comme ça!`
        : `🚀 Your net worth grew by $${Math.abs(netChange).toLocaleString('en-CA')} this week. Keep it up!`
      );
    } else if (netChange < -100) {
      messages.push(isFr
        ? `📊 Ta valeur nette a bougé de ${netChange.toLocaleString('fr-CA')} $ cette semaine. C'est normal — les fluctuations font partie du budget.`
        : `📊 Your net worth moved by $${netChange.toLocaleString('en-CA')} this week. That's normal — fluctuations are part of the journey.`
      );
    }
  }

  // 2. Coaching basé sur les objectifs
  if (report.objectifs && report.objectifs.length > 0) {
    const reached = report.objectifs.filter(o => o.justReached);
    const advancing = report.objectifs.filter(o => o.progressChange && o.progressChange > 0);

    if (reached.length > 0) {
      messages.push(isFr
        ? `🎉 Félicitations! Tu as atteint ton objectif "${reached[0].name}"!`
        : `🎉 Congratulations! You reached your goal "${reached[0].name}"!`
      );
    } else if (advancing.length > 0) {
      messages.push(isFr
        ? `🎯 Tu te rapproches de "${advancing[0].name}" (+${advancing[0].progressChange}% cette semaine). Chaque pas compte!`
        : `🎯 You're getting closer to "${advancing[0].name}" (+${advancing[0].progressChange}% this week). Every step counts!`
      );
    }
  }

  // 3. Coaching basé sur le budget (string 'balanced' ou 'unbalanced')
  if (report.budgetStatus === 'balanced' && messages.length < 2) {
    messages.push(isFr
      ? `✅ Ton budget est bien équilibré. Tu gardes le cap!`
      : `✅ Your budget is well balanced. You're on track!`
    );
  } else if (report.budgetStatus === 'unbalanced' && messages.length < 2) {
    messages.push(isFr
      ? `⚠️ Ton budget montre un déséquilibre. Un petit ajustement dans PL4TO pourrait faire la différence.`
      : `⚠️ Your budget shows an imbalance. A small adjustment in PL4TO could make a difference.`
    );
  }

  // 4. Coaching basé sur le fonds d'urgence
  if (report.emergencyFund && messages.length < 2) {
    const months = report.emergencyFund.moisSurvie;
    if (months >= 3) {
      messages.push(isFr
        ? `🛡️ Ton fonds d'urgence couvre ${months} mois. Solide protection!`
        : `🛡️ Your emergency fund covers ${months} months. Solid protection!`
      );
    } else if (months < 1) {
      messages.push(isFr
        ? `🛡️ Ton fonds d'urgence est à ${months} mois. Vise au moins 3 mois — chaque dollar compte.`
        : `🛡️ Your emergency fund is at ${months} months. Aim for at least 3 months — every dollar counts.`
      );
    }
  }

  return messages.slice(0, 2);
}

const weeklyReportTemplate = {
  fr: {
    generate: (prenom, report, userId) => ({
      subject: `📊 ${prenom}, voici ton résumé de la semaine`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #fbbf24;">O</span>
            </h1>
            <p style="color: #999; font-size: 14px; margin-top: 5px;">
              La plateforme qui s'occupe de ton budget
            </p>
          </div>
          
          <!-- Greeting -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #040449; font-size: 24px; margin: 0 0 8px 0;">
              Bonjour ${prenom}! 👋
            </h2>
            <p style="color: #666; font-size: 15px; margin: 0;">
              Voici ton résumé de la semaine du ${report.weekStart}
            </p>
          </div>

          <!-- 🗓️ SECTION 1: Ta semaine à venir (TOUJOURS affichée) -->
          ${report.semaineAVenir && report.semaineAVenir.transactions.length > 0 ? `
          <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #667eea30;">
            <p style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0; font-weight: bold;">
              🗓️ Ta semaine à venir
            </p>
            ${report.semaineAVenir.transactions.slice(0, 5).map(t => {
              const dateObj = new Date(t.date + 'T00:00:00');
              const dayName = dateObj.toLocaleDateString('fr-CA', { weekday: 'short' });
              const dateLabel = dateObj.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
              const isExpense = t.type === 'expense';
              return `
              <div style="margin-bottom: 6px; padding: 6px 0; border-bottom: 1px solid #e9ecef;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="color: #333; font-size: 14px;">${t.name}</td>
                    <td style="color: #999; font-size: 12px; text-align: center; width: 90px;">${dayName} ${dateLabel}</td>
                    <td style="color: ${isExpense ? '#ef4444' : '#22c55e'}; font-size: 14px; font-weight: bold; text-align: right; width: 80px;">
                      ${isExpense ? '-' : '+'}${Math.abs(t.amount).toLocaleString('fr-CA')} $
                    </td>
                  </tr>
                </table>
              </div>`;
            }).join('')}
            <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #667eea30;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #666; font-size: 13px;">Total sorties cette semaine</td>
                  <td style="color: #ef4444; font-size: 14px; font-weight: bold; text-align: right;">
                    -${report.semaineAVenir.totalSorties.toLocaleString('fr-CA')} $
                  </td>
                </tr>
              </table>
            </div>
          </div>
          ` : ''}

          <!-- 💡 COACHING PL4TO (FR) -->
          ${(() => {
            const coaching = getCoachingMessage(report, 'fr');
            if (coaching.length === 0) return '';
            return `
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 15px; border: 1px solid #bbf7d0;">
              <p style="color: #166534; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; font-weight: bold;">
                💡 Coach PL4TO
              </p>
              ${coaching.map(msg => `
                <p style="color: #15803d; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">
                  ${msg}
                </p>
              `).join('')}
            </div>`;
          })()}

          <!-- 💰 SECTION: Économies possibles cette semaine -->
          ${report.savingsOpportunities && report.savingsOpportunities.length > 0 ? `
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #bbf7d0;">
            <p style="color: #166534; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0; font-weight: bold;">
              💰 Tes économies possibles
            </p>
            ${report.savingsOpportunities.map(opp => `
            <div style="margin-bottom: 10px; padding: 10px 14px; background: rgba(255,255,255,0.7); border-radius: 10px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #333; font-size: 14px; font-weight: 600;">
                    ${opp.icon} ${opp.category}
                  </td>
                  <td style="text-align: right;">
                    <span style="color: #22c55e; font-size: 14px; font-weight: 700;">
                      ~${opp.savingsAmount}$/mois
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="color: #666; font-size: 12px; padding-top: 4px;">
                    ${opp.tip}
                  </td>
                </tr>
              </table>
            </div>
            `).join('')}
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #bbf7d0; text-align: center;">
              <p style="color: #15803d; font-size: 15px; font-weight: 700; margin: 0;">
                💡 Potentiel: ${report.totalPotentialSavings}$/an d'économies
              </p>
              <p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">
                Ouvre PL4TO pour appliquer ces économies à ton budget
              </p>
            </div>
          </div>
          ` : ''}

          <!-- 📅 SECTION 2: Prochain événement (seulement si changé) -->
          ${report.changedSections.showNextEvent && report.nextEvent ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📅 Prochain événement
            </p>
            <p style="color: #040449; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
              ${report.nextEvent.emoji} ${report.nextEvent.name} — <span style="color: #667eea;">${report.nextEvent.timeUntil}</span>
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              As-tu prévu ton budget pour cet événement?
            </p>
          </div>
          ` : ''}

          <!-- 🛡️ SECTION 3: Fonds d'urgence (seulement si changé ou critique) -->
          ${report.changedSections.showEmergencyFund && report.emergencyFund ? `
          <div style="background: ${report.emergencyFund.status === 'critical' ? '#fef2f2' : report.emergencyFund.status === 'low' ? '#fffbeb' : '#f0fdf4'}; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid ${report.emergencyFund.status === 'critical' ? '#fecaca' : report.emergencyFund.status === 'low' ? '#fef3c7' : '#bbf7d0'};">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🛡️ Fonds d'urgence
            </p>
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">
                  ${report.emergencyFund.status === 'critical' ? '🚨' : report.emergencyFund.status === 'low' ? '⚠️' : '✅'}
                </td>
                <td style="vertical-align: middle;">
                  <p style="color: ${report.emergencyFund.status === 'critical' ? '#ef4444' : report.emergencyFund.status === 'low' ? '#f59e0b' : '#22c55e'}; font-size: 16px; font-weight: bold; margin: 0;">
                    ${report.emergencyFund.moisSurvie} mois de réserve
                  </p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">
                    ${report.emergencyFund.status === 'critical' ? 'Chaque petit montant mis de côté compte!' : report.emergencyFund.status === 'low' ? 'Tu progresses! Objectif: 6 mois.' : 'Ton fonds est en bonne santé!'}
                  </p>
                </td>
              </tr>
            </table>
            <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 12px; overflow: hidden;">
              <div style="background: ${report.emergencyFund.status === 'critical' ? '#ef4444' : report.emergencyFund.status === 'low' ? '#f59e0b' : '#22c55e'}; height: 100%; width: ${Math.min((report.emergencyFund.moisSurvie / 6) * 100, 100)}%; border-radius: 4px;"></div>
            </div>
            <p style="color: #999; font-size: 11px; margin: 4px 0 0 0; text-align: right;">${report.emergencyFund.moisSurvie} / 6 mois</p>
          </div>
          ` : ''}

          <!-- 📋 SECTION 4: Budget (seulement si le statut a changé) -->
          ${report.changedSections.showBudgetStatus && report.budgetStatus ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📋 Répartition budgétaire
            </p>
            ${report.budgetStatus === 'balanced' ? `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">✅</td>
                <td style="vertical-align: middle;">
                  <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0;">Équilibré</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Ton budget est bien réparti. Continue comme ça!</p>
                </td>
              </tr>
            </table>
            ` : `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">⚖️</td>
                <td style="vertical-align: middle;">
                  <p style="color: #f59e0b; font-size: 16px; font-weight: bold; margin: 0;">Petit ajustement requis</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Ta répartition pourrait bénéficier d'un ajustement. Consulte ton outil!</p>
                </td>
              </tr>
            </table>
            `}
          </div>
          ` : ''}

          <!-- 🧭 SECTION 5: Objectifs en mouvement (seulement ceux qui ont bougé) -->
          ${report.changedSections.showObjectifs && report.objectifs && report.objectifs.length > 0 ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
              🧭 Objectifs en mouvement
            </p>
            ${report.objectifs.filter(obj =>
                !report.changedSections.changedGoalNames ||
                report.changedSections.changedGoalNames.includes(obj.name) ||
                report.changedSections.isFirstReport
              ).map(obj => `
            <div style="margin-bottom: 14px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #333; font-size: 14px;">${obj.justReached ? '🎉' : obj.isReached ? '✅' : '📍'} ${obj.name}</td>
                  <td style="color: ${obj.isReached ? '#22c55e' : '#667eea'}; font-size: 14px; font-weight: bold; text-align: right;">
                    ${obj.progress}%${obj.progressChange !== null && obj.progressChange !== 0 ? ` <span style="color: ${obj.progressChange > 0 ? '#22c55e' : '#ef4444'}; font-size: 12px;">(${obj.progressChange > 0 ? '↑' : '↓'} ${obj.progressChange > 0 ? '+' : ''}${obj.progressChange}%)</span>` : ''}
                  </td>
                </tr>
              </table>
              <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 6px; overflow: hidden;">
                <div style="background: ${obj.isReached ? '#22c55e' : '#667eea'}; height: 100%; width: ${obj.progress}%; border-radius: 4px;"></div>
              </div>
              ${obj.justReached ? `<p style="color: #22c55e; font-size: 12px; margin: 4px 0 0 0; font-style: italic;">🎉 Objectif atteint cette semaine!</p>` : ''}
            </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- 🚦 SECTION 6: Trajectoire (seulement si le nombre d'alertes a changé) -->
          ${report.changedSections.showTrajectory ? `
          <div style="background: ${report.alertesCount > 0 ? '#fef2f2' : '#fffbeb'}; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid ${report.alertesCount > 0 ? '#fecaca' : '#fef3c7'};">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🚦 Ton budget dans le temps
            </p>
            ${report.alertesCount > 0 ? `
            <p style="color: #ef4444; font-size: 15px; font-weight: bold; margin: 0 0 6px 0;">
              ⚠️ ${report.alertesCount} alerte${report.alertesCount > 1 ? 's' : ''} détectée${report.alertesCount > 1 ? 's' : ''} dans les 6 prochains mois
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
              Consulte PL4TO pour voir les détails et ajuster ton budget.
            </p>
            ` : `
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              ✅ Aucune alerte détectée. Continue comme ça!
            </p>
            `}
          </div>
          ` : ''}

          <!-- ✨ Message "Tout est stable" quand rien n'a changé -->
          ${!report.changedSections.showNextEvent && !report.changedSections.showEmergencyFund &&
            !report.changedSections.showBudgetStatus && !report.changedSections.showObjectifs &&
            !report.changedSections.showTrajectory ? `
          <div style="background: #f0fdf4; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #bbf7d0; text-align: center;">
            <p style="font-size: 24px; margin: 0 0 8px 0;">✨</p>
            <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">
              Tout est stable cette semaine
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              Ton budget et tes objectifs avancent bien. Continue!
            </p>
          </div>
          ` : ''}

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0 0 15px 0;">
              ${report.totalPotentialSavings > 0
                ? `💡 Tu pourrais économiser ${report.totalPotentialSavings}$/an — viens voir comment!`
                : report.comparisons?.valeurNetteChange > 0
                  ? '📈 Ton budget évolue — viens voir le détail!'
                  : '📊 Ton résumé t\'attend — viens voir tes prévisions!'}
            </p>
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              <!--[if mso]><i style="mso-font-width:200%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
              <span style="color: #ffffff;">Ouvrir mon PL4TO →</span>
              <!--[if mso]><i style="mso-font-width:200%;">&nbsp;</i><![endif]-->
            </a>
          </div>

          <!-- Signature -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
              Bonne semaine ${prenom}!<br>
              <span style="color: #999;">— L'équipe PL4TO</span>
            </p>
          </div>

          <!-- PS -->
          <div style="background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="color: #999; font-size: 13px; margin: 0;">
              PS: Tes proches pourraient aussi bénéficier de PL4TO! Partage-leur pl4to.com 🧭
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — La plateforme qui s'occupe de ton budget
            </p>
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              <a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=weekly" style="color: #bbb; text-decoration: underline;">Se désabonner du résumé hebdomadaire</a>
            </p>
          </div>

        </div>
      </body>
      </html>
      `
    })
  },
  en: {
    generate: (prenom, report, userId) => ({
      subject: `📊 ${prenom}, here's your weekly summary`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #fbbf24;">O</span>
            </h1>
            <p style="color: #999; font-size: 14px; margin-top: 5px;">
              The platform that takes care of your budget
            </p>
          </div>
          
          <!-- Greeting -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #040449; font-size: 24px; margin: 0 0 8px 0;">
              Hello ${prenom}! 👋
            </h2>
            <p style="color: #666; font-size: 15px; margin: 0;">
              Here's your summary for the week of ${report.weekStart}
            </p>
          </div>

          <!-- 🗓️ SECTION 1: Your week ahead (ALWAYS shown) -->
          ${report.semaineAVenir && report.semaineAVenir.transactions.length > 0 ? `
          <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #667eea30;">
            <p style="color: #667eea; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0; font-weight: bold;">
              🗓️ Your week ahead
            </p>
            ${report.semaineAVenir.transactions.slice(0, 5).map(t => {
              const dateObj = new Date(t.date + 'T00:00:00');
              const dayName = dateObj.toLocaleDateString('en-CA', { weekday: 'short' });
              const dateLabel = dateObj.toLocaleDateString('en-CA', { day: 'numeric', month: 'short' });
              const isExpense = t.type === 'expense';
              return `
              <div style="margin-bottom: 6px; padding: 6px 0; border-bottom: 1px solid #e9ecef;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="color: #333; font-size: 14px;">${t.name}</td>
                    <td style="color: #999; font-size: 12px; text-align: center; width: 90px;">${dayName} ${dateLabel}</td>
                    <td style="color: ${isExpense ? '#ef4444' : '#22c55e'}; font-size: 14px; font-weight: bold; text-align: right; width: 80px;">
                      ${isExpense ? '-' : '+'}${Math.abs(t.amount).toLocaleString('en-CA')} $
                    </td>
                  </tr>
                </table>
              </div>`;
            }).join('')}
            <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #667eea30;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #666; font-size: 13px;">Total outflows this week</td>
                  <td style="color: #ef4444; font-size: 14px; font-weight: bold; text-align: right;">
                    -${report.semaineAVenir.totalSorties.toLocaleString('en-CA')} $
                  </td>
                </tr>
              </table>
            </div>
          </div>
          ` : ''}

          <!-- 💡 COACHING PL4TO (EN) -->
          ${(() => {
            const coaching = getCoachingMessage(report, 'en');
            if (coaching.length === 0) return '';
            return `
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 16px; padding: 20px 24px; margin-bottom: 15px; border: 1px solid #bbf7d0;">
              <p style="color: #166534; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; font-weight: bold;">
                💡 PL4TO Coach
              </p>
              ${coaching.map(msg => `
                <p style="color: #15803d; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">
                  ${msg}
                </p>
              `).join('')}
            </div>`;
          })()}

          <!-- 💰 SECTION: Potential savings this week -->
          ${report.savingsOpportunities && report.savingsOpportunities.length > 0 ? `
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #bbf7d0;">
            <p style="color: #166534; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0; font-weight: bold;">
              💰 Your potential savings
            </p>
            ${report.savingsOpportunities.map(opp => `
            <div style="margin-bottom: 10px; padding: 10px 14px; background: rgba(255,255,255,0.7); border-radius: 10px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #333; font-size: 14px; font-weight: 600;">
                    ${opp.icon} ${opp.category}
                  </td>
                  <td style="text-align: right;">
                    <span style="color: #22c55e; font-size: 14px; font-weight: 700;">
                      ~$${opp.savingsAmount}/mo
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="color: #666; font-size: 12px; padding-top: 4px;">
                    ${opp.tip}
                  </td>
                </tr>
              </table>
            </div>
            `).join('')}
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #bbf7d0; text-align: center;">
              <p style="color: #15803d; font-size: 15px; font-weight: 700; margin: 0;">
                💡 Potential: $${report.totalPotentialSavings}/year in savings
              </p>
              <p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">
                Open PL4TO to apply these savings to your budget
              </p>
            </div>
          </div>
          ` : ''}

          <!-- 📅 SECTION 2: Next event (only if changed) -->
          ${report.changedSections.showNextEvent && report.nextEvent ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📅 Next event
            </p>
            <p style="color: #040449; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
              ${report.nextEvent.emoji} ${report.nextEvent.name} — <span style="color: #667eea;">${report.nextEvent.timeUntil}</span>
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              Have you planned your budget for this event?
            </p>
          </div>
          ` : ''}

          <!-- 🛡️ SECTION 3: Emergency fund (only if changed or critical) -->
          ${report.changedSections.showEmergencyFund && report.emergencyFund ? `
          <div style="background: ${report.emergencyFund.status === 'critical' ? '#fef2f2' : report.emergencyFund.status === 'low' ? '#fffbeb' : '#f0fdf4'}; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid ${report.emergencyFund.status === 'critical' ? '#fecaca' : report.emergencyFund.status === 'low' ? '#fef3c7' : '#bbf7d0'};">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🛡️ Emergency fund
            </p>
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">
                  ${report.emergencyFund.status === 'critical' ? '🚨' : report.emergencyFund.status === 'low' ? '⚠️' : '✅'}
                </td>
                <td style="vertical-align: middle;">
                  <p style="color: ${report.emergencyFund.status === 'critical' ? '#ef4444' : report.emergencyFund.status === 'low' ? '#f59e0b' : '#22c55e'}; font-size: 16px; font-weight: bold; margin: 0;">
                    ${report.emergencyFund.moisSurvie} months of reserve
                  </p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">
                    ${report.emergencyFund.status === 'critical' ? 'Every small amount set aside counts!' : report.emergencyFund.status === 'low' ? 'You\'re making progress! Goal: 6 months.' : 'Your fund is in great shape!'}
                  </p>
                </td>
              </tr>
            </table>
            <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 12px; overflow: hidden;">
              <div style="background: ${report.emergencyFund.status === 'critical' ? '#ef4444' : report.emergencyFund.status === 'low' ? '#f59e0b' : '#22c55e'}; height: 100%; width: ${Math.min((report.emergencyFund.moisSurvie / 6) * 100, 100)}%; border-radius: 4px;"></div>
            </div>
            <p style="color: #999; font-size: 11px; margin: 4px 0 0 0; text-align: right;">${report.emergencyFund.moisSurvie} / 6 months</p>
          </div>
          ` : ''}

          <!-- 📋 SECTION 4: Budget (only if status changed) -->
          ${report.changedSections.showBudgetStatus && report.budgetStatus ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              📋 Budget overview
            </p>
            ${report.budgetStatus === 'balanced' ? `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">✅</td>
                <td style="vertical-align: middle;">
                  <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0;">Balanced</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Your budget is well balanced. Keep it up!</p>
                </td>
              </tr>
            </table>
            ` : `
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">⚖️</td>
                <td style="vertical-align: middle;">
                  <p style="color: #f59e0b; font-size: 16px; font-weight: bold; margin: 0;">Small adjustment needed</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Your budget could use a small adjustment. Check your tool!</p>
                </td>
              </tr>
            </table>
            `}
          </div>
          ` : ''}

          <!-- 🧭 SECTION 5: Goals in motion (only those that moved) -->
          ${report.changedSections.showObjectifs && report.objectifs && report.objectifs.length > 0 ? `
          <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
              🧭 Goals in motion
            </p>
            ${report.objectifs.filter(obj =>
                !report.changedSections.changedGoalNames ||
                report.changedSections.changedGoalNames.includes(obj.name) ||
                report.changedSections.isFirstReport
              ).map(obj => `
            <div style="margin-bottom: 14px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="color: #333; font-size: 14px;">${obj.justReached ? '🎉' : obj.isReached ? '✅' : '📍'} ${obj.name}</td>
                  <td style="color: ${obj.isReached ? '#22c55e' : '#667eea'}; font-size: 14px; font-weight: bold; text-align: right;">
                    ${obj.progress}%${obj.progressChange !== null && obj.progressChange !== 0 ? ` <span style="color: ${obj.progressChange > 0 ? '#22c55e' : '#ef4444'}; font-size: 12px;">(${obj.progressChange > 0 ? '↑' : '↓'} ${obj.progressChange > 0 ? '+' : ''}${obj.progressChange}%)</span>` : ''}
                  </td>
                </tr>
              </table>
              <div style="background: #e9ecef; border-radius: 4px; height: 6px; margin-top: 6px; overflow: hidden;">
                <div style="background: ${obj.isReached ? '#22c55e' : '#667eea'}; height: 100%; width: ${obj.progress}%; border-radius: 4px;"></div>
              </div>
              ${obj.justReached ? `<p style="color: #22c55e; font-size: 12px; margin: 4px 0 0 0; font-style: italic;">🎉 Goal reached this week!</p>` : ''}
            </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- 🚦 SECTION 6: Trajectory (only if alert count changed) -->
          ${report.changedSections.showTrajectory ? `
          <div style="background: ${report.alertesCount > 0 ? '#fef2f2' : '#fffbeb'}; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid ${report.alertesCount > 0 ? '#fecaca' : '#fef3c7'};">
            <p style="color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">
              🚦 Your budget over time
            </p>
            ${report.alertesCount > 0 ? `
            <p style="color: #ef4444; font-size: 15px; font-weight: bold; margin: 0 0 6px 0;">
              ⚠️ ${report.alertesCount} alert${report.alertesCount > 1 ? 's' : ''} detected in the next 6 months
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
              Check PL4TO to see the details and adjust your budget.
            </p>
            ` : `
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              ✅ No alerts detected. Keep it up!
            </p>
            `}
          </div>
          ` : ''}

          <!-- ✨ "Everything is stable" message when nothing changed -->
          ${!report.changedSections.showNextEvent && !report.changedSections.showEmergencyFund &&
            !report.changedSections.showBudgetStatus && !report.changedSections.showObjectifs &&
            !report.changedSections.showTrajectory ? `
          <div style="background: #f0fdf4; border-radius: 16px; padding: 24px; margin-bottom: 15px; border: 1px solid #bbf7d0; text-align: center;">
            <p style="font-size: 24px; margin: 0 0 8px 0;">✨</p>
            <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">
              Everything is stable this week
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              Your budget and goals are progressing well. Keep it up!
            </p>
          </div>
          ` : ''}

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 35px;">
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0 0 15px 0;">
              ${report.totalPotentialSavings > 0
                ? `💡 You could save $${report.totalPotentialSavings}/year — come see how!`
                : report.comparisons?.valeurNetteChange > 0
                  ? '📈 Your budget is evolving — come see the details!'
                  : '📊 Your summary is ready — come see your forecast!'}
            </p>
            <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
              <!--[if mso]><i style="mso-font-width:200%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
              <span style="color: #ffffff;">Open my PL4TO →</span>
              <!--[if mso]><i style="mso-font-width:200%;">&nbsp;</i><![endif]-->
            </a>
          </div>

          <!-- Signature -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
              Have a great week ${prenom}!<br>
              <span style="color: #999;">— The PL4TO team</span>
            </p>
          </div>

          <!-- PS -->
          <div style="background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="color: #999; font-size: 13px; margin: 0;">
              PS: Your friends could also benefit from PL4TO! Share pl4to.com 🧭
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">
              PL4T<span style="color: #fbbf24;">O</span> — The platform that takes care of your budget
            </p>
            <p style="color: #bbb; font-size: 12px; margin: 0;">
              <a href="${BACKEND_URL}/api/communications/unsubscribe?userId=${userId}&type=weekly" style="color: #bbb; text-decoration: underline;">Unsubscribe from weekly reports</a>
            </p>
          </div>

        </div>
      </body>
      </html>
      `
    })
  }
};

module.exports = weeklyReportTemplate;

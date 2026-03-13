// 📧 PL4TO - Template Email Récap 1 mois (S2)
// Envoyé 30 jours après l'abonnement
// "1 mois avec PL4TO — Ton récap"

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const oneMonthRecapTemplate = {
  fr: {
    subject: '🎉 1 mois avec PL4TO — Et ce n\'est que le début!',
    generate: (prenom, userId) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #ff9800;">O</span>
            </h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">
              Ton outil
            </p>
          </div>
          
          <!-- Card principale -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Titre -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                <span style="color: #ff9800;">${prenom}</span>, ça fait déjà 1 mois!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Tu fais partie des premiers à piloter tes finances avec PL4TO
              </p>
            </div>
            
            <!-- Badge 1 mois -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ff9800; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
                🎖️ Membre fondateur
              </p>
              <p style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 8px 0;">
                30 jours
              </p>
              <p style="color: #ffffff; font-size: 14px; margin: 0;">
                de clarté financière
              </p>
            </div>
            
            <!-- Ce que tu as accompli -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              En un mois, tu as pris le contrôle de ta trajectoire financière. 
              Ton budget, tes comptes, tes objectifs — tout est en place pour voir loin.
            </p>
            
            <!-- Rappel des outils -->
            <h3 style="color: #040449; font-size: 17px; margin: 0 0 18px 0; text-align: center;">
              📌 N'oublie pas ces fonctionnalités
            </h3>
            
            <div style="margin-bottom: 25px;">
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #ff9800;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">📅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Voyage dans le temps</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Navigue 1 an, 5 ans, 10 ans dans le futur pour voir l'impact de tes décisions</p>
                  </td>
                </tr></table>
              </div>
              
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #667eea;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧮</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Simulations illimitées</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Teste autant de scénarios que tu veux — c'est fait pour ça</p>
                  </td>
                </tr></table>
              </div>
              
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 0; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧭</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Objectifs avec dates précises</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Sais exactement quand tu atteindras chacun de tes objectifs</p>
                  </td>
                </tr></table>
              </div>
            </div>
            
            <!-- Teaser : Ce qui s'en vient -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 2px;">
                🔮 bientôt disponible
              </p>
              <p style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 12px 0;">
                Alain, ton coach financier IA
              </p>
              <p style="color: #e0e4f5; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
                Imagine un assistant intelligent intégré directement dans ta trajectoire. 
                Il analyse, repère les opportunités et te donne des recommandations 
                personnalisées en temps réel.
              </p>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 12px; margin-top: 10px;">
                <p style="color: #ffffff; font-size: 12px; margin: 0; font-style: italic;">
                  💬 "Tu pourrais atteindre ton objectif 3 mois plus vite en ajustant ce poste de dépense..."
                </p>
              </div>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #219a52 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);">
                🚀 Voir ma trajectoire
              </a>
            </div>
            
            <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
              Merci de faire partie de l'aventure PL4TO. On construit cet outil pour toi. 🙏
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Tu reçois cet email en tant que membre du plan Essentiel de PL4TO.
              <a href="${BACKEND_URL}/api/emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Gérer mes préférences</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Ton outil
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  en: {
    subject: '🎉 1 month with PL4TO — And this is just the beginning!',
    generate: (prenom, userId) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <!-- Header PL4TO -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #040449; font-size: 32px; margin: 0;">
              PL4T<span style="color: #ff9800;">O</span>
            </h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">
              Your tool
            </p>
          </div>
          
          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Title -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                <span style="color: #ff9800;">${prenom}</span>, it's been 1 month already!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                You're among the first to navigate your finances with PL4TO
              </p>
            </div>
            
            <!-- 1 month badge -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ff9800; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
                🎖️ Founding member
              </p>
              <p style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 8px 0;">
                30 days
              </p>
              <p style="color: #ffffff; font-size: 14px; margin: 0;">
                of financial clarity
              </p>
            </div>
            
            <!-- What you've accomplished -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              In one month, you've taken control of your financial trajectory. 
              Your budget, your accounts, your goals — everything is in place to see far ahead.
            </p>
            
            <!-- Feature reminders -->
            <h3 style="color: #040449; font-size: 17px; margin: 0 0 18px 0; text-align: center;">
              📌 Don't forget these features
            </h3>
            
            <div style="margin-bottom: 25px;">
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #ff9800;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">📅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Time travel</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Navigate 1 year, 5 years, 10 years into the future to see the impact of your decisions</p>
                  </td>
                </tr></table>
              </div>
              
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #667eea;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧮</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Unlimited simulations</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Test as many scenarios as you want — that's what it's for</p>
                  </td>
                </tr></table>
              </div>
              
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 0; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧭</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Goals with precise dates</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Know exactly when you'll reach each of your goals</p>
                  </td>
                </tr></table>
              </div>
            </div>
            
            <!-- Teaser: Coming soon -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 2px;">
                🔮 coming soon
              </p>
              <p style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 12px 0;">
                Alain, your AI financial coach
              </p>
              <p style="color: #e0e4f5; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
                Imagine an intelligent assistant built right into your trajectory. 
                It analyzes, spots opportunities and gives you personalized 
                recommendations in real time.
              </p>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 12px; margin-top: 10px;">
                <p style="color: #ffffff; font-size: 12px; margin: 0; font-style: italic;">
                  💬 "You could reach your goal 3 months faster by adjusting this expense..."
                </p>
              </div>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #219a52 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);">
                🚀 See my trajectory
              </a>
            </div>
            
            <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
              Thank you for being part of the PL4TO adventure. We're building this tool for you. 🙏
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              You're receiving this email as a member of the PL4TO Essential plan.
              <a href="${BACKEND_URL}/api/emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Manage preferences</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Your tool
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

module.exports = oneMonthRecapTemplate;

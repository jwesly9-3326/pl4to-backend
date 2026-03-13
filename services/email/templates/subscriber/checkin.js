// 📧 PL4TO - Template Email Check-in (S1)
// Envoyé 14 jours après l'abonnement
// "Comment se passe ton expérience?"

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const checkinTemplate = {
  fr: {
    subject: '💬 Comment se passe ton expérience avec PL4TO?',
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
              <div style="font-size: 48px; margin-bottom: 10px;">💬</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                <span style="color: #ff9800;">${prenom}</span>, comment ça se passe?
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Ça fait déjà 2 semaines que tu pilotes tes finances
              </p>
            </div>
            
            <!-- Message principal -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              On voulait prendre de tes nouvelles et on espère que ton outil répond à tes attentes.
            </p>
            
            <!-- 3 questions check-in -->
            <h3 style="color: #040449; font-size: 17px; margin: 0 0 18px 0; text-align: center;">
              🧭 As-tu eu le temps d'explorer?
            </h3>
            
            <div style="margin-bottom: 25px;">
              <!-- Question 1 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #ff9800;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧭</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Amélioration de parcours</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">PL4TO t'aide à optimiser ta trajectoire en identifiant les ajustements qui font la différence</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Question 2 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #667eea;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">⚖️</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Balancement automatique</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Bientôt, PL4TO balancera automatiquement tes comptes pour garder ta trajectoire sur la bonne voie</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Question 3 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 0; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧮</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">La calculatrice de simulations</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Teste des scénarios avant de prendre une décision — sans aucun risque</p>
                  </td>
                </tr></table>
              </div>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0 20px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Explorer mon outil
              </a>
            </div>
            
            <!-- Feedback section -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #5a6fd6 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0 0 0;">
              <p style="color: #ffffff; font-size: 15px; font-weight: bold; margin: 0 0 10px 0;">
                💡 Ton feedback est précieux
              </p>

            </div>
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
    subject: '💬 How is your PL4TO experience going?',
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
              <div style="font-size: 48px; margin-bottom: 10px;">💬</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                <span style="color: #ff9800;">${prenom}</span>, how's it going?
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                It's been 2 weeks since you started navigating your finances
              </p>
            </div>
            
            <!-- Main message -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              We wanted to check in and we hope your tool is meeting your expectations.
            </p>
            
            <!-- 3 check-in questions -->
            <h3 style="color: #040449; font-size: 17px; margin: 0 0 18px 0; text-align: center;">
              🧭 Have you had time to explore?
            </h3>
            
            <div style="margin-bottom: 25px;">
              <!-- Question 1 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #ff9800;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧭</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Path optimization</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">PL4TO helps you optimize your trajectory by identifying adjustments that make a difference</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Question 2 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #667eea;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">⚖️</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Automatic balancing</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Soon, PL4TO will automatically balance your accounts to keep your trajectory on track</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Question 3 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 0; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="font-size: 18px;">🧮</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">The simulation calculator</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Test scenarios before making a decision — completely risk-free</p>
                  </td>
                </tr></table>
              </div>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0 20px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Explore my tool
              </a>
            </div>
            
            <!-- Feedback section -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #5a6fd6 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0 0 0;">
              <p style="color: #ffffff; font-size: 15px; font-weight: bold; margin: 0 0 10px 0;">
                💡 Your feedback is valuable
              </p>

            </div>
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

module.exports = checkinTemplate;

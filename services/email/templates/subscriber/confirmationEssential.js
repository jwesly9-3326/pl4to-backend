// 📧 PL4TO - Template Email Confirmation Abonnement Essentiel (S0)
// Envoyé quand l'utilisateur souscrit au plan Essentiel
// Inclut le Guide PDF en pièce jointe

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const confirmationEssentialTemplate = {
  fr: {
    subject: '🎉 Bienvenue dans le plan Essentiel — Ton outil est débloqué!',
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
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                Félicitations, <span style="color: #ff9800;">${prenom}</span>!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Tu fais maintenant partie du plan Essentiel
              </p>
            </div>
            
            <!-- Message principal -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Merci d'avoir choisi PL4TO pour piloter tes finances. Tu as maintenant accès à 
              <strong style="color: #040449;">toutes les fonctionnalités</strong> sans aucune limite. 
              Ton outil est prêt à te guider vers tes objectifs!
            </p>
            
            <!-- Badge Plan Essentiel -->
            <div style="background: linear-gradient(135deg, #27ae60 0%, #219a52 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
                ✅ Plan actif
              </p>
              <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">
                Essentiel
              </p>
              <p style="color: #ffffff; font-size: 14px; margin: 0;">
                Accès complet — Aucune limite
              </p>
            </div>
            
            <!-- Fonctionnalités débloquées -->
            <h3 style="color: #040449; font-size: 18px; margin: 0 0 20px 0; text-align: center;">
              🔓 Ce qui est maintenant débloqué
            </h3>
            
            <div style="margin-bottom: 30px;">
              <!-- Feature 1 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Vues Jour, Mois et Année</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Visualise ta trajectoire sous tous les angles</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 2 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Projection sur plusieurs années</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Vois loin dans ton futur financier</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 3 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Comptes illimités</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Crée autant de comptes que tu veux</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 4 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Objectifs illimités</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Suis tous tes objectifs avec des dates précises</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 5 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 0; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Simulations illimitées</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Teste tous les scénarios que tu veux avec la calculatrice</p>
                  </td>
                </tr></table>
              </div>
            </div>
            
            <!-- Guide PDF -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #5a6fd6 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <div style="font-size: 36px; margin-bottom: 8px;">📘</div>
              <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">
                Ton Guide de Bienvenue est en pièce jointe!
              </p>
              <p style="color: #e0e4f5; font-size: 13px; margin: 0;">
                Tout ce que tu dois savoir pour maîtriser ton outil en un seul document.
              </p>
            </div>
            
            <!-- Prix fondateur -->
            <div style="background: #fff8ee; border-radius: 10px; padding: 18px; text-align: center; margin: 0 0 30px 0; border: 1px dashed #ff9800;">
              <p style="color: #040449; font-size: 14px; margin: 0 0 4px 0;">
                🏷️ Ton prix fondateur
              </p>
              <p style="color: #ff9800; font-size: 28px; font-weight: bold; margin: 0 0 4px 0;">
                5,99$/mois
              </p>
              <p style="color: #999; font-size: 12px; margin: 0; text-decoration: line-through;">
                Prix régulier : 9,99$/mois
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #219a52 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);">
                🚀 Explorer ma trajectoire
              </a>
            </div>
            
            <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
              Des questions? Réponds directement à cet email, on est là pour toi.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Tu reçois cet email suite à ton abonnement au plan Essentiel de PL4TO.
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
    subject: '🎉 Welcome to the Essential Plan — Your tool is fully unlocked!',
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
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                Congratulations, <span style="color: #ff9800;">${prenom}</span>!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                You're now on the Essential plan
              </p>
            </div>
            
            <!-- Main message -->
            <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Thank you for choosing PL4TO to navigate your finances. You now have access to 
              <strong style="color: #040449;">all features</strong> with no limits. 
              Your tool is ready to guide you toward your goals!
            </p>
            
            <!-- Essential Plan Badge -->
            <div style="background: linear-gradient(135deg, #27ae60 0%, #219a52 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
                ✅ Active plan
              </p>
              <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">
                Essential
              </p>
              <p style="color: #ffffff; font-size: 14px; margin: 0;">
                Full access — No limits
              </p>
            </div>
            
            <!-- Unlocked features -->
            <h3 style="color: #040449; font-size: 18px; margin: 0 0 20px 0; text-align: center;">
              🔓 What's now unlocked
            </h3>
            
            <div style="margin-bottom: 30px;">
              <!-- Feature 1 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Day, Month, and Year views</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">See your trajectory from every angle</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 2 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Multi-year projection</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">See far into your financial future</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 3 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Unlimited accounts</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Create as many accounts as you need</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 4 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Unlimited goals</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Track all your goals with precise dates</p>
                  </td>
                </tr></table>
              </div>
              
              <!-- Feature 5 -->
              <div style="background: #f8f9fc; border-radius: 10px; padding: 14px 18px; margin-bottom: 0; border-left: 4px solid #27ae60;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                  <td style="width: 30px; vertical-align: top;">
                    <span style="color: #27ae60; font-size: 18px;">✅</span>
                  </td>
                  <td>
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Unlimited simulations</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Test every scenario you want with the calculator</p>
                  </td>
                </tr></table>
              </div>
            </div>
            
            <!-- Guide PDF -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #5a6fd6 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <div style="font-size: 36px; margin-bottom: 8px;">📘</div>
              <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">
                Your Welcome Guide is attached!
              </p>
              <p style="color: #e0e4f5; font-size: 13px; margin: 0;">
                Everything you need to know to master your tool, all in one document.
              </p>
            </div>
            
            <!-- Founder price -->
            <div style="background: #fff8ee; border-radius: 10px; padding: 18px; text-align: center; margin: 0 0 30px 0; border: 1px dashed #ff9800;">
              <p style="color: #040449; font-size: 14px; margin: 0 0 4px 0;">
                🏷️ Your founder price
              </p>
              <p style="color: #ff9800; font-size: 28px; font-weight: bold; margin: 0 0 4px 0;">
                $5.99/month
              </p>
              <p style="color: #999; font-size: 12px; margin: 0; text-decoration: line-through;">
                Regular price: $9.99/month
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="https://pl4to.com/gps" 
                 style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #219a52 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);">
                🚀 Explore my trajectory
              </a>
            </div>
            
            <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
              Questions? Reply directly to this email, we're here for you.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              You're receiving this email because you subscribed to the PL4TO Essential plan.
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

module.exports = confirmationEssentialTemplate;

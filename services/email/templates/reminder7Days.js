// 📧 PL4TO - Template Email Rappel 7 jours (Jour 7)
// Même message que le popup in-app — rappel mi-parcours

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const reminder7DaysTemplate = {
  fr: {
    subject: '⏳ Il te reste 7 jours pour explorer ton plan Essentiel',
    generate: (prenom, trialEndDate, daysRemaining, userId) => `
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
              Ton GPS Financier
            </p>
          </div>
          
          <!-- Card principale -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Titre -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, mi-parcours!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Ton essai Essentiel est à la moitié
              </p>
            </div>

            <!-- COMPTEUR CENTRAL -->
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                Il te reste
              </p>
              <div style="font-size: 52px; font-weight: 900; color: white; margin: 0; line-height: 1;">
                ${daysRemaining}
              </div>
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 8px 0 0 0;">
                jours d'essai Essentiel
              </p>
            </div>

            <!-- MESSAGE -->
            <div style="margin-bottom: 25px;">
              <p style="color: #555; font-size: 15px; line-height: 1.7; text-align: center; margin: 0;">
                La moitié de ton essai est déjà passée. Si tu n'as pas encore eu le temps d'explorer ton outil, c'est le bon moment pour t'y remettre!
              </p>
            </div>

            <!-- CE QUI EST INCLUS -->
            <div style="background: #f8f9ff; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 16px; margin: 0 0 15px 0; text-align: center;">
                🔓 Ce que tu as accès avec Essentiel
              </h3>
              
              <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Vues Mensuelle et Annuelle de ta trajectoire</span>
              </div>
              
              <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Calculatrice de simulations illimitée</span>
              </div>
              
              <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Gestion complète de ton portefeuille</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Objectifs financiers avec suivi de progression</span>
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧭 Ouvrir mon outil
              </a>
            </div>

            <!-- Note rassurante -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">Aucune carte de crédit requise.</strong> Ton essai se termine automatiquement — tu ne seras jamais facturé sans ton accord.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Tu reçois cet email car tu as créé un compte sur PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Ne plus recevoir d'emails</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Ton GPS Financier
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  en: {
    subject: '⏳ You have 7 days left to explore your Essential plan',
    generate: (prenom, trialEndDate, daysRemaining, userId) => `
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
              Your Financial GPS
            </p>
          </div>
          
          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Title -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, halfway there!
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                Your Essential trial is at the halfway point
              </p>
            </div>

            <!-- CENTRAL COUNTER -->
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                You have
              </p>
              <div style="font-size: 52px; font-weight: 900; color: white; margin: 0; line-height: 1;">
                ${daysRemaining}
              </div>
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 8px 0 0 0;">
                days left in your Essential trial
              </p>
            </div>

            <!-- MESSAGE -->
            <div style="margin-bottom: 25px;">
              <p style="color: #555; font-size: 15px; line-height: 1.7; text-align: center; margin: 0;">
                Half of your trial has already passed. If you haven't had time to explore your tool yet, now is the perfect time to jump back in!
              </p>
            </div>

            <!-- WHAT'S INCLUDED -->
            <div style="background: #f8f9ff; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 16px; margin: 0 0 15px 0; text-align: center;">
                🔓 What you get with Essential
              </h3>
              
              <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Monthly and Yearly trajectory views</span>
              </div>
              
              <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Unlimited simulation calculator</span>
              </div>
              
              <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Full portfolio management</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="color: #ff9800; font-size: 1.2em; margin-right: 10px;">✦</span>
                <span style="color: #333; font-size: 14px;">Financial goals with progress tracking</span>
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧭 Open my tool
              </a>
            </div>

            <!-- Reassurance -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">No credit card required.</strong> Your trial ends automatically — you'll never be charged without your consent.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              You're receiving this email because you created an account on PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #888; text-decoration: underline; margin-left: 8px;">Stop receiving emails</a>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Your Financial GPS
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

module.exports = reminder7DaysTemplate;

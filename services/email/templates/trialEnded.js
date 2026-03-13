// 📧 PL4TO - Template Email Trial Terminé (Jour 14)
// Ton empathique + Récap positif + Porte ouverte

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const trialEndedTemplate = {
  fr: {
    subject: '🧭 Ton essai Essentiel est terminé — et maintenant?',
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
            <p style="color: #555; font-size: 15px; margin-top: 5px;">
              Le GPS pour ton portefeuille
            </p>
          </div>

          <!-- Card principale -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧭</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, ton essai est terminé
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0 0 20px 0;">
                Mais ton parcours financier continue
              </p>
              <div style="background: #fff8e1; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #ffcc80;">
                <p style="color: #555; font-size: 15px; margin: 0; line-height: 1.7;">
                  💙 Merci d'avoir essayé PL4TO, ${prenom}.<br>
                  On espère t'avoir aidé à voir plus clair dans tes finances.<br>
                  <strong>Quand tu seras prêt, on est là.</strong>
                </p>
              </div>
            </div>

            <!-- Ce que tu gardes (Positif) -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 20px; margin: 0 0 15px 0;">
                ✅ Ce que tu gardes avec le plan Gratuit
              </h3>
              <div style="font-size: 15px; color: #444; line-height: 1.8;">
                <div style="margin-bottom: 8px;">✓ Vue journalière de ton PL4TO</div>
                <div style="margin-bottom: 8px;">✓ 3 comptes dans ton portefeuille</div>
                <div style="margin-bottom: 8px;">✓ 2 objectifs à suivre</div>
                <div style="margin-bottom: 8px;">✓ 5 simulations par mois</div>
                <div>✓ Projection sur 90 jours</div>
              </div>
              <p style="color: #2e7d32; font-size: 14px; margin: 15px 0 0 0; font-style: italic;">
                Tu peux continuer à utiliser PL4TO gratuitement! 🎉
              </p>
            </div>

            <!-- Ce qui te manquera peut-être -->
            <div style="background: #f5f5f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #555; font-size: 18px; margin: 0 0 15px 0;">
                💭 Ce qui te manquera peut-être...
              </h3>
              <div style="font-size: 15px; color: #666; line-height: 1.8;">
                <div style="margin-bottom: 8px;">• La vue mensuelle et annuelle pour voir le grand portrait</div>
                <div style="margin-bottom: 8px;">• La calculatrice illimitée pour simuler tous tes scénarios</div>
                <div style="margin-bottom: 8px;">• La projection sur plusieurs années pour planifier loin</div>
                <div>• Les comptes et objectifs illimités</div>
              </div>
            </div>

            <!-- Offre étendue -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Le prix premiers utilisateurs est encore disponible
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                <strong style="color: #ff9800;">Accès limité</strong>
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px; margin-bottom: 15px;">
                <span style="color: #ff9800; font-size: 32px; font-weight: bold;">5,99$</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/mois</span>
                <br>
                <span style="color: rgba(255,255,255,0.7); font-size: 14px; text-decoration: line-through;">9,99$/mois ensuite</span>
              </div>
              <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0;">
                Ce prix ne sera plus disponible très bientôt.
              </p>
            </div>

            <!-- CTA Principal -->
            <div style="text-align: center; margin: 25px 0 20px 0;">
              <a href="https://pl4to.com/parametres" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Débloquer l'accès Essentiel
              </a>
            </div>

          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #777; font-size: 13px; margin: 0;">
              Tu reçois cet email car tu as créé un compte sur PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #666; text-decoration: underline; margin-left: 8px;">Ne plus recevoir d'emails</a>
            </p>
            <p style="color: #777; font-size: 13px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Le GPS pour ton portefeuille
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  en: {
    subject: '🧭 Your Essential trial has ended — what\'s next?',
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
            <p style="color: #555; font-size: 15px; margin-top: 5px;">
              The GPS for your wallet
            </p>
          </div>

          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧭</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, your trial has ended
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0 0 20px 0;">
                But your financial journey continues
              </p>
              <div style="background: #fff8e1; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #ffcc80;">
                <p style="color: #555; font-size: 15px; margin: 0; line-height: 1.7;">
                  💙 Thanks for trying PL4TO, ${prenom}.<br>
                  We hope we helped you see your finances more clearly.<br>
                  <strong>When you're ready, we're here.</strong>
                </p>
              </div>
            </div>

            <!-- What you keep (Positive) -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 20px; margin: 0 0 15px 0;">
                ✅ What you keep with the Free plan
              </h3>
              <div style="font-size: 15px; color: #444; line-height: 1.8;">
                <div style="margin-bottom: 8px;">✓ Daily view of your PL4TO</div>
                <div style="margin-bottom: 8px;">✓ 3 accounts in your wallet</div>
                <div style="margin-bottom: 8px;">✓ 2 goals to track</div>
                <div style="margin-bottom: 8px;">✓ 5 simulations per month</div>
                <div>✓ 90-day projection</div>
              </div>
              <p style="color: #2e7d32; font-size: 14px; margin: 15px 0 0 0; font-style: italic;">
                You can keep using PL4TO for free! 🎉
              </p>
            </div>

            <!-- What you might miss -->
            <div style="background: #f5f5f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #555; font-size: 18px; margin: 0 0 15px 0;">
                💭 What you might miss...
              </h3>
              <div style="font-size: 15px; color: #666; line-height: 1.8;">
                <div style="margin-bottom: 8px;">• Monthly and yearly view to see the big picture</div>
                <div style="margin-bottom: 8px;">• Unlimited calculator to simulate all your scenarios</div>
                <div style="margin-bottom: 8px;">• Multi-year projection to plan ahead</div>
                <div>• Unlimited accounts and goals</div>
              </div>
            </div>

            <!-- Extended offer -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">🎁</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                The early user price is still available
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                <strong style="color: #ff9800;">Limited access</strong>
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px; margin-bottom: 15px;">
                <span style="color: #ff9800; font-size: 32px; font-weight: bold;">$5.99</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/month</span>
                <br>
                <span style="color: rgba(255,255,255,0.7); font-size: 14px; text-decoration: line-through;">$9.99/month after</span>
              </div>
              <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0;">
                This price won't be available much longer.
              </p>
            </div>

            <!-- Main CTA -->
            <div style="text-align: center; margin: 25px 0 20px 0;">
              <a href="https://pl4to.com/parametres" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🚀 Unlock Essential access
              </a>
            </div>

          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #777; font-size: 13px; margin: 0;">
              You're receiving this email because you created an account on PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #666; text-decoration: underline; margin-left: 8px;">Stop receiving emails</a>
            </p>
            <p style="color: #777; font-size: 13px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — The GPS for your wallet
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

module.exports = trialEndedTemplate;

// 📧 PL4TO - Template Email Calculatrice (Jour 6)
// Découverte de la calculatrice de simulations

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const featureDiscoveryTemplate = {
  fr: {
    subject: '🔢 Et si tu pouvais tester des scénarios avant qu\'ils arrivent?',
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
              <div style="font-size: 48px; margin-bottom: 10px;">🔢</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, teste avant de décider
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                La calculatrice qui te donne les réponses en avance
              </p>
            </div>

            <!-- Reminder trial -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 25px;">
              <p style="color: #040449; font-size: 14px; margin: 0;">
                ⏰ Il te reste bientôt <strong>${daysRemaining} jours</strong> d'essai Essentiel
              </p>
            </div>

            <!-- CONCEPT -->
            <div style="margin-bottom: 25px;">
              <p style="color: #555; font-size: 15px; line-height: 1.7; text-align: center; margin: 0;">
                Tu te demandes si tu peux te permettre un achat? Si un ajustement changerait vraiment ta trajectoire? Ta <strong>calculatrice</strong> te permet de tester n'importe quel scénario — sans risque.
              </p>
            </div>

            <!-- EXEMPLES DE SCÉNARIOS -->
            <h3 style="color: #040449; font-size: 16px; margin: 0 0 15px 0; text-align: center;">
              💡 Exemples de ce que tu peux tester
            </h3>

            <!-- Scénario 1 -->
            <div style="background: #fff8e1; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ff9800;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4em;">💸</span>
                <div>
                  <strong style="color: #040449; font-size: 15px;">"Si je dépensais 150$ pour le fun..."</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Ajoute une dépense temporaire et vois l'impact sur tes soldes futurs.</p>
                </div>
              </div>
            </div>

            <!-- Scénario 2 -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #667eea;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4em;">🌱</span>
                <div>
                  <strong style="color: #040449; font-size: 15px;">"Si j'épargnais ce mois 250$..."</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Vois comment ça transforme ta trajectoire sur plusieurs années.</p>
                </div>
              </div>
            </div>

            <!-- Scénario 3 -->
            <div style="background: #f0fff4; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #27ae60;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4em;">📋</span>
                <div>
                  <strong style="color: #040449; font-size: 15px;">"Si je réduisais des dépenses à 300$..."</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Compare avant/après et prends ta décision en toute confiance.</p>
                </div>
              </div>
            </div>

            <!-- COMMENT ÇA MARCHE -->
            <div style="background: #f8f8ff; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
              <h4 style="color: #040449; font-size: 15px; margin: 0 0 12px 0;">⚡ Comment ça marche?</h4>
              <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0;">
                Choisis une période, ajoute ou retire une dépense, et clique <strong>GO</strong>. L'outil recalcule instantanément ta trajectoire pour te montrer le résultat.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/simulations" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🔢 Essayer la calculatrice
              </a>
            </div>

            <!-- Astuce -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">Astuce :</strong> Tes simulations ne modifient jamais ton budget réel. Tu peux tester autant de scénarios que tu veux, sans conséquence.
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
    subject: '🔢 What if you could test scenarios before they happen?',
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
              <div style="font-size: 48px; margin-bottom: 10px;">🔢</div>
              <h2 style="color: #040449; font-size: 24px; margin: 0 0 10px 0;">
                ${prenom}, test before you decide
              </h2>
              <p style="color: #888; font-size: 15px; margin: 0;">
                The calculator that gives you answers in advance
              </p>
            </div>

            <!-- Trial reminder -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 25px;">
              <p style="color: #040449; font-size: 14px; margin: 0;">
                ⏰ You have almost <strong>${daysRemaining} days</strong> left in your Essential trial
              </p>
            </div>

            <!-- CONCEPT -->
            <div style="margin-bottom: 25px;">
              <p style="color: #555; font-size: 15px; line-height: 1.7; text-align: center; margin: 0;">
                Wondering if you can afford a purchase? If an adjustment would really change your trajectory? The <strong>simulation calculator</strong> lets you test any scenario — risk-free.
              </p>
            </div>

            <!-- SCENARIO EXAMPLES -->
            <h3 style="color: #040449; font-size: 16px; margin: 0 0 15px 0; text-align: center;">
              💡 Examples of what you can test
            </h3>

            <!-- Scenario 1 -->
            <div style="background: #fff8e1; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ff9800;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4em;">💸</span>
                <div>
                  <strong style="color: #040449; font-size: 15px;">"What if I spent $150 just for fun..."</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Add a temporary expense and see the impact on your future balances.</p>
                </div>
              </div>
            </div>

            <!-- Scenario 2 -->
            <div style="background: #f0f4ff; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #667eea;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4em;">🌱</span>
                <div>
                  <strong style="color: #040449; font-size: 15px;">"What if I saved $250 this month..."</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">See how it transforms your trajectory over several years.</p>
                </div>
              </div>
            </div>

            <!-- Scenario 3 -->
            <div style="background: #f0fff4; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #27ae60;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4em;">📋</span>
                <div>
                  <strong style="color: #040449; font-size: 15px;">"What if I cut expenses to $300..."</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Compare before/after and make your decision with confidence.</p>
                </div>
              </div>
            </div>

            <!-- HOW IT WORKS -->
            <div style="background: #f8f8ff; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
              <h4 style="color: #040449; font-size: 15px; margin: 0 0 12px 0;">⚡ How does it work?</h4>
              <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0;">
                Choose a period, add or remove an expense, and hit <strong>GO</strong>. The tool instantly recalculates your trajectory to show you the result.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/simulations" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🔢 Try the calculator
              </a>
            </div>

            <!-- Tip -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.6;">
                💡 <strong style="color: #ffffff;">Tip:</strong> Your simulations never change your actual budget. You can test as many scenarios as you want, with no consequences.
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

module.exports = featureDiscoveryTemplate;

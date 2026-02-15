// 📧 PL4TO - Template Email Conversion 2 (Jour 11)
// Calculatrice - Prendre de meilleures décisions financières

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const conversion2CalculatorTemplate = {
  fr: {
    subject: '🧮 Avant de décider... laisse ton outil te montrer l\'impact',
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
              Ton GPS Financier
            </p>
          </div>
          
          <!-- Card principale -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Titre -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧮</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, et si tu pouvais voir l'avenir?
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0;">
                Prends des décisions éclairées, pas des risques
              </p>
            </div>

            <!-- Le problème -->
            <div style="background: #ffebee; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #ef5350;">
              <h3 style="color: #c62828; font-size: 18px; margin: 0 0 12px 0;">
                😰 Le piège des décisions à l'aveugle
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0;">
                "Est-ce que je peux me permettre ce nouvel achat?"<br>
                "Qu'est-ce qui arrive si j'augmente mon épargne de 50$/mois?"<br>
                "Ce nouvel abonnement... ça va vraiment impacter mon budget?"
              </p>
              <p style="color: #666; font-size: 14px; margin: 15px 0 0 0; font-style: italic;">
                Sans outil, ces décisions sont des devinettes. Et les devinettes coûtent cher.
              </p>
            </div>

            <!-- La solution: Calculatrice -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 18px; margin: 0 0 12px 0;">
                🧮 Ta Calculatrice de Simulations
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Ton outil te montre exactement l'impact sur ta trajectoire, tu peux <strong>simuler n'importe quel scénario</strong> AVANT de prendre une décision.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <strong style="color: #333; font-size: 15px;">📱 Exemple: "Un nouvel achat à 1 500$"</strong>
                <div style="margin-top: 10px; font-size: 15px; color: #444;">
                  <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                    <span>Impact sur ton objectif voyage:</span>
                    <span style="color: #e65100; font-weight: bold;">+2 mois</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                    <span>Nouveau solde fin d'année:</span>
                    <span style="color: #c62828; font-weight: bold;">-1 500$</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                    <span>Zone de "trafic" créée:</span>
                    <span style="color: #e65100; font-weight: bold;">Mars 2026</span>
                  </div>
                </div>
              </div>
              
              <p style="color: #2e7d32; font-size: 14px; margin: 0; font-style: italic;">
                💡 Maintenant tu SAIS. Tu peux décider en connaissance de cause.
              </p>
            </div>

            <!-- Scénarios de simulation -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 18px; margin: 0 0 15px 0; text-align: center;">
                ⚡ Ce que tu peux simuler
              </h3>
              
              <div style="display: grid; gap: 10px;">
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">🌱</span>
                  <span style="color: #333; font-size: 15px;">"Si j'augmente mon épargne de 100$/mois..."</span>
                </div>
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">🏠</span>
                  <span style="color: #333; font-size: 15px;">"Si mon loyer augmente de 200$..."</span>
                </div>
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">📺</span>
                  <span style="color: #333; font-size: 15px;">"Si j'annule 3 abonnements..."</span>
                </div>
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">🛒</span>
                  <span style="color: #333; font-size: 15px;">"Si je dépensais 250$ ce mois..."</span>
                </div>
              </div>
            </div>

            <!-- Urgence -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">⏰</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Plus que ${daysRemaining} jours
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                Ta Calculatrice de Simulations fait partie du plan <strong style="color: #ff9800;">Essentiel</strong>.<br>
                Garde ton accès pour seulement:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px;">
                <span style="color: #ff9800; font-size: 28px; font-weight: bold;">5,99$</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/mois</span>
              </div>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 15px 0 0 0;">
                🔒 Prix premiers utilisateurs garanti
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/calculatrice" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧮 Essayer ma Calculatrice
              </a>
            </div>

            <!-- Note -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                💡 Une mauvaise décision financière peut te coûter des mois de travail.<br>
                <strong>Ton outil t'aide à éviter ça.</strong>
              </p>
            </div>

          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #777; font-size: 13px; margin: 0;">
              Tu reçois cet email car tu as créé un compte sur PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #666; text-decoration: underline; margin-left: 8px;">Ne plus recevoir d'emails</a>
            </p>
            <p style="color: #777; font-size: 13px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Ton GPS Financier
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  en: {
    subject: '🧮 Before you decide... let your tool show you the impact',
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
              Your Financial GPS
            </p>
          </div>
          
          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Title -->
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🧮</div>
              <h2 style="color: #040449; font-size: 26px; margin: 0 0 10px 0;">
                ${prenom}, what if you could see the future?
              </h2>
              <p style="color: #555; font-size: 16px; margin: 0;">
                Make informed decisions, not risky guesses
              </p>
            </div>

            <!-- The problem -->
            <div style="background: #ffebee; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #ef5350;">
              <h3 style="color: #c62828; font-size: 18px; margin: 0 0 12px 0;">
                😰 The trap of blind decisions
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0;">
                "Can I really afford this new purchase?"<br>
                "What happens if I increase my savings by $50/month?"<br>
                "This new subscription... will it really impact my budget?"
              </p>
              <p style="color: #666; font-size: 14px; margin: 15px 0 0 0; font-style: italic;">
                Without a tool, these decisions are guesses. And guesses are expensive.
              </p>
            </div>

            <!-- The solution: Calculator -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; font-size: 18px; margin: 0 0 12px 0;">
                🧮 Your Simulation Calculator
              </h3>
              <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                Your tool shows you exactly the impact on your trajectory, you can <strong>simulate any scenario</strong> BEFORE making a decision.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <strong style="color: #333; font-size: 15px;">📱 Example: "A new purchase at $1,500"</strong>
                <div style="margin-top: 10px; font-size: 15px; color: #444;">
                  <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                    <span>Impact on your trip goal:</span>
                    <span style="color: #e65100; font-weight: bold;">+2 months</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                    <span>New year-end balance:</span>
                    <span style="color: #c62828; font-weight: bold;">-$1,500</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                    <span>"Traffic" zone created:</span>
                    <span style="color: #e65100; font-weight: bold;">March 2026</span>
                  </div>
                </div>
              </div>
              
              <p style="color: #2e7d32; font-size: 14px; margin: 0; font-style: italic;">
                💡 Now you KNOW. You can decide with full knowledge.
              </p>
            </div>

            <!-- Simulation scenarios -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #040449; font-size: 18px; margin: 0 0 15px 0; text-align: center;">
                ⚡ What you can simulate
              </h3>
              
              <div style="display: grid; gap: 10px;">
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">🌱</span>
                  <span style="color: #333; font-size: 15px;">"If I increase my savings by $100/month..."</span>
                </div>
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">🏠</span>
                  <span style="color: #333; font-size: 15px;">"If my rent increases by $200..."</span>
                </div>
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">📺</span>
                  <span style="color: #333; font-size: 15px;">"If I cancel 3 subscriptions..."</span>
                </div>
                <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">🛒</span>
                  <span style="color: #333; font-size: 15px;">"If I spent $250 this month..."</span>
                </div>
              </div>
            </div>

            <!-- Urgency -->
            <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 25px;">
              <div style="font-size: 28px; margin-bottom: 10px;">⏰</div>
              <h3 style="color: #ff9800; font-size: 20px; margin: 0 0 10px 0;">
                Only ${daysRemaining} days left
              </h3>
              <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                Your Simulation Calculator is part of the <strong style="color: #ff9800;">Essential</strong> plan.<br>
                Keep your access for only:
              </p>
              <div style="display: inline-block; background: rgba(255, 152, 0, 0.2); border: 2px solid #ff9800; border-radius: 12px; padding: 15px 30px;">
                <span style="color: #ff9800; font-size: 28px; font-weight: bold;">$5.99</span>
                <span style="color: rgba(255,255,255,0.9); font-size: 15px;">/month</span>
              </div>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 15px 0 0 0;">
                🔒 Early user price guaranteed
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="https://pl4to.com/calculatrice" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                🧮 Try my Calculator
              </a>
            </div>

            <!-- Note -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                💡 One bad financial decision can cost you months of work.<br>
                <strong>Your tool helps you avoid that.</strong>
              </p>
            </div>

          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #777; font-size: 13px; margin: 0;">
              You're receiving this email because you created an account on PL4TO.
              <a href="${BACKEND_URL}/api/trial-emails/opt-out/${userId}" style="color: #666; text-decoration: underline; margin-left: 8px;">Stop receiving emails</a>
            </p>
            <p style="color: #777; font-size: 13px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} PL4TO — Your Financial GPS
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

module.exports = conversion2CalculatorTemplate;

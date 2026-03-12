// 📧 PL4TO - Service d'envoi d'emails
// Utilise Resend pour l'envoi d'emails transactionnels

const { Resend } = require('resend');

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

// Email d'expédition - Domaine pl4to.com vérifié ✅
const FROM_EMAIL = process.env.FROM_EMAIL || 'PL4TO <noreply@pl4to.com>';

const emailService = {
  /**
   * Envoyer un code de vérification d'email
   * @param {string} to - Email du destinataire
   * @param {string} prenom - Prénom de l'utilisateur
   * @param {string} code - Code à 6 chiffres
   * @param {string} [customSubject] - Sujet personnalisé (optionnel)
   * @param {string} [type] - Type d'email: 'verification' | 'email_change' (optionnel)
   */
  sendVerificationCode: async (to, prenom, code, customSubject = null, type = 'verification') => {
    try {
      // Déterminer le sujet et le message selon le type
      const isEmailChange = type === 'email_change' || customSubject?.includes('Changement');
      const subject = customSubject || `🔐 Ton code de vérification PL4TO: ${code}`;
      const welcomeMessage = isEmailChange 
        ? `Salut ${prenom}! Tu as demandé à changer ton adresse email PL4TO.`
        : `Utilise ce code pour vérifier ton adresse email et activer ton compte PL4TO.`;
      const headerTitle = isEmailChange ? 'Changement d\'email' : `Bienvenue ${prenom}! 🎉`;
      const footerMessage = isEmailChange 
        ? 'Si tu n\'as pas demandé ce changement d\'email, ignore cet email et ton adresse restera inchangée.'
        : 'Si tu n\'as pas créé de compte PL4TO, ignore cet email.';
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header avec logo -->
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
                <h2 style="color: #040449; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                  ${headerTitle}
                </h2>
                
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                  ${welcomeMessage}
                </p>
                
                <!-- Code de vérification -->
                <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                  <p style="color: #ffffff; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                    Ton code de vérification
                  </p>
                  <p style="color: #ffffff; font-size: 42px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">
                    ${code}
                  </p>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
                  ⏰ Ce code expire dans <strong>15 minutes</strong>.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  ${footerMessage}
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  © ${new Date().getFullYear()} PL4TO - Ton GPS Financier
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `${headerTitle} ${welcomeMessage} Ton code de vérification PL4TO est: ${code}. Ce code expire dans 15 minutes.`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend:', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Code envoyé à:', to, 'ID:', data.id);
      return { success: true, id: data.id };
      
    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Générer un code aléatoire à 6 chiffres
   */
  generateCode: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Envoyer un email de réinitialisation de mot de passe
   * @param {string} to - Email du destinataire
   * @param {string} prenom - Prénom de l'utilisateur
   * @param {string} resetToken - Token de réinitialisation
   * @param {string} resetUrl - URL complète de réinitialisation
   */
  sendPasswordResetEmail: async (to, prenom, resetToken, resetUrl) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: `🔑 Réinitialise ton mot de passe PL4TO`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header avec logo -->
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
                <h2 style="color: #040449; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                  🔑 Réinitialisation du mot de passe
                </h2>
                
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                  Salut ${prenom}! Tu as demandé à réinitialiser ton mot de passe PL4TO.
                </p>
                
                <!-- Bouton de réinitialisation -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    🔐 Réinitialiser mon mot de passe
                  </a>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                  ⏰ Ce lien expire dans <strong>1 heure</strong>.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                  Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur:<br>
                  <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  Si tu n'as pas demandé cette réinitialisation, ignore cet email.
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  © ${new Date().getFullYear()} PL4TO - Ton GPS Financier
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Salut ${prenom}! Tu as demandé à réinitialiser ton mot de passe PL4TO. Clique sur ce lien pour créer un nouveau mot de passe: ${resetUrl}. Ce lien expire dans 1 heure. Si tu n'as pas demandé cette réinitialisation, ignore cet email.`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend (reset):', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Email de réinitialisation envoyé à:', to, 'ID:', data.id);
      return { success: true, id: data.id };
      
    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envoyer une notification de waitlist à l'équipe PL4TO
   * @param {string} email - Email de l'utilisateur inscrit
   * @param {string} plan - Plan demandé (pro_ia)
   * @param {string} source - Source de l'inscription
   */
  sendWaitlistNotification: async (email, plan, source) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [process.env.ADMIN_NOTIFICATION_EMAIL || 'support@pl4to.ca'],
        subject: `📥 Nouvelle inscription Waitlist Pro + IA`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0 0 10px 0;">🎉 Nouvelle inscription Waitlist!</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Plan Pro + IA</p>
              </div>
              
              <div style="background: white; border-radius: 16px; padding: 30px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h3 style="color: #333; margin: 0 0 20px 0;">📧 Détails de l'inscription</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Email:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-weight: bold;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Plan:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #8b5cf6; font-weight: bold;">${plan}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Source:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${source}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #666;">Date:</td>
                    <td style="padding: 12px 0; color: #333;">${new Date().toLocaleString('fr-CA')}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} PL4TO - Notification automatique
              </p>
            </div>
          </body>
          </html>
        `,
        text: `Nouvelle inscription Waitlist Pro + IA! Email: ${email}, Plan: ${plan}, Source: ${source}, Date: ${new Date().toLocaleString('fr-CA')}`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend (waitlist):', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Notification waitlist envoyée, ID:', data.id);
      return { success: true, id: data.id };
      
    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envoyer les identifiants du portail entreprise après approbation
   * @param {string} to - Email du destinataire
   * @param {string} contactName - Nom du contact
   * @param {string} cabinetName - Nom du cabinet
   * @param {string} identifiant - Identifiant PLT-YYYY-XXXX
   * @param {string} password - Mot de passe temporaire
   */
  sendEnterpriseCredentials: async (to, contactName, cabinetName, identifiant, password) => {
    try {
      const prenom = contactName.split(' ')[0] || contactName;
      const loginUrl = 'https://pl4to.com/pro/login';

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: `🏢 Bienvenue sur PL4TO Pro — Vos identifiants`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #040449; font-size: 32px; margin: 0;">
                  PL4T<span style="color: #ff9800;">O</span> <span style="font-size: 16px; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;">PRO</span>
                </h1>
                <p style="color: #666; font-size: 14px; margin-top: 5px;">
                  Portail Entreprise
                </p>
              </div>

              <!-- Card principale -->
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 25px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                  <h2 style="color: #040449; font-size: 22px; margin: 0;">
                    Votre demande a été approuvée!
                  </h2>
                </div>

                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                  Bonjour ${prenom},
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                  Nous avons le plaisir de vous confirmer que le portail entreprise pour <strong>${cabinetName}</strong> est maintenant actif. Voici vos identifiants de connexion :
                </p>

                <!-- Identifiants -->
                <div style="background: linear-gradient(135deg, #040449 0%, #100261 100%); border-radius: 14px; padding: 30px; margin: 0 0 25px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Identifiant</span>
                        <div style="color: #22c55e; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 3px; margin-top: 6px;">
                          ${identifiant}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px 0 5px;">
                        <span style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Mot de passe temporaire</span>
                        <div style="color: #fbbf24; font-size: 22px; font-weight: bold; font-family: monospace; letter-spacing: 2px; margin-top: 6px;">
                          ${password}
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Avertissement -->
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; padding: 14px 18px; margin: 0 0 25px 0;">
                  <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
                    ⚠️ Important : Vous devrez changer votre mot de passe lors de votre première connexion.
                  </p>
                </div>

                <!-- Bouton connexion -->
                <div style="text-align: center; margin: 30px 0 0 0;">
                  <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
                    Se connecter au portail
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  Si vous n'avez pas fait cette demande, veuillez ignorer ce courriel.
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  &copy; ${new Date().getFullYear()} PL4TO - Ton GPS Financier
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Bienvenue sur PL4TO Pro!\n\nBonjour ${prenom},\n\nVotre portail entreprise pour ${cabinetName} est maintenant actif.\n\nIdentifiant: ${identifiant}\nMot de passe temporaire: ${password}\n\nConnectez-vous sur: ${loginUrl}\n\nImportant: Changez votre mot de passe lors de votre première connexion.\n\n© ${new Date().getFullYear()} PL4TO`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend (enterprise credentials):', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Identifiants entreprise envoyés à:', to, 'ID:', data.id);
      return { success: true, id: data.id };

    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // 📧 Email d'invitation client (B2B2C)
  // Envoyé par le courtier au client pour l'inviter à créer un compte PL4TO
  // ============================================
  sendClientInvitation: async (to, clientName, cabinetName, inviteUrl) => {
    try {
      const prenom = clientName.split(' ')[0] || clientName || 'Client';

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: `🏢 ${cabinetName} vous invite sur PL4TO`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="margin:0;padding:0;background:#f0f0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
              <!-- Header -->
              <div style="text-align:center;margin-bottom:30px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#040449,#0a0a5c);padding:15px 30px;border-radius:12px;">
                  <span style="color:white;font-size:1.6em;font-weight:bold;letter-spacing:2px;">PL4T<span style="color:#ffd700;">O</span></span>
                </div>
              </div>

              <!-- Card -->
              <div style="background:white;border-radius:16px;padding:40px 35px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                <h1 style="color:#1e293b;font-size:1.4em;margin:0 0 15px;text-align:center;">
                  🤝 Votre conseiller vous invite
                </h1>
                <p style="color:#64748b;font-size:0.95em;line-height:1.6;text-align:center;margin:0 0 25px;">
                  Bonjour ${prenom},<br>
                  <strong style="color:#1e293b;">${cabinetName}</strong> vous invite à utiliser PL4TO,
                  le GPS pour vos finances personnelles.
                </p>

                <!-- Avantages -->
                <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:25px;">
                  <p style="color:#334155;font-weight:600;margin:0 0 12px;font-size:0.95em;">✨ Vos avantages:</p>
                  <div style="color:#64748b;font-size:0.9em;line-height:2;">
                    📊 Visualisez votre trajectoire financière<br>
                    💰 Gérez vos comptes et votre budget<br>
                    🎯 Définissez et suivez vos objectifs<br>
                    🏷️ Tarif préférentiel grâce à votre conseiller
                  </div>
                </div>

                <!-- CTA Button -->
                <div style="text-align:center;margin-bottom:25px;">
                  <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:16px 40px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:1.05em;box-shadow:0 6px 20px rgba(102,126,234,0.3);">
                    ✨ Créer mon compte gratuit
                  </a>
                </div>

                <p style="color:#94a3b8;font-size:0.8em;text-align:center;line-height:1.5;">
                  Ce lien est valide pendant 30 jours.<br>
                  Si vous n'avez pas demandé cette invitation, ignorez ce courriel.
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align:center;margin-top:25px;color:#94a3b8;font-size:0.75em;">
                <p style="margin:0;">© ${new Date().getFullYear()} Application financière PL4TO | 9558-7168 Québec inc.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `${cabinetName} vous invite sur PL4TO!\n\nBonjour ${prenom},\n\nVotre conseiller ${cabinetName} vous invite à utiliser PL4TO, le GPS pour vos finances personnelles.\n\nCréez votre compte gratuit: ${inviteUrl}\n\nCe lien est valide pendant 30 jours.\n\n© ${new Date().getFullYear()} PL4TO`
      });

      if (error) {
        console.error('❌ [EMAIL] Erreur Resend (client invitation):', error);
        return { success: false, error };
      }

      console.log('✅ [EMAIL] Invitation client envoyée à:', to, 'ID:', data.id);
      return { success: true, id: data.id };

    } catch (error) {
      console.error('❌ [EMAIL] Erreur:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;

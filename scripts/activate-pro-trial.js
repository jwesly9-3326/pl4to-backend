// 🎁 Script d'activation Plan Pro + IA (14 jours) + envoi courriel
// Usage: node scripts/activate-pro-trial.js
// Cible: desirfafane@gmail.com

require('dotenv').config();
const prisma = require('../prisma-client');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'PL4TO <contact@pl4to.com>';

const TARGET_EMAIL = 'desirfafane@gmail.com';

// ── HTML du courriel ──
function generateEmailHTML() {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:1px;">
                PL<span style="color:#fbbf24;">4</span>TO
              </h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.9); font-size:14px;">
                Le GPS pour ton portefeuille
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">

              <p style="font-size:16px; color:#1f2937; line-height:1.6; margin:0 0 20px;">
                Bonjour,
              </p>

              <p style="font-size:16px; color:#1f2937; line-height:1.6; margin:0 0 24px;">
                L'&eacute;quipe PL4TO vous offre <strong>14 jours d'acc&egrave;s gratuit au Plan Pro + IA</strong>, notre plan le plus complet, pour vous aider &agrave; reprendre le contr&ocirc;le de votre situation financi&egrave;re.
              </p>

              <!-- Divider -->
              <hr style="border:none; border-top:2px solid #e5e7eb; margin:28px 0;">

              <h2 style="font-size:20px; color:#6366f1; margin:0 0 20px;">
                &#127873; Ce que vous recevez &mdash; Plan Pro + IA (14 jours)
              </h2>

              <!-- Feature: Portefeuille -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8f7ff; border-radius:10px; padding:20px; border-left:4px solid #6366f1;">
                    <h3 style="margin:0 0 8px; font-size:16px; color:#1f2937;">
                      &#128188; Portefeuille complet
                    </h3>
                    <p style="margin:0; font-size:14px; color:#4b5563; line-height:1.6;">
                      Ajoutez tous vos comptes &mdash; ch&egrave;que, &eacute;pargne, cartes de cr&eacute;dit, hypoth&egrave;que, marge de cr&eacute;dit, investissements et crypto. Configurez un seuil de s&eacute;curit&eacute; sur votre compte ch&egrave;que pour ne jamais descendre en dessous d'un montant que vous choisissez. Suivez les int&eacute;r&ecirc;ts calcul&eacute;s automatiquement sur vos cartes de cr&eacute;dit, votre hypoth&egrave;que et votre &eacute;pargne.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature: Budget -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8f7ff; border-radius:10px; padding:20px; border-left:4px solid #8b5cf6;">
                    <h3 style="margin:0 0 8px; font-size:16px; color:#1f2937;">
                      &#128203; Budget intelligent
                    </h3>
                    <p style="margin:0; font-size:14px; color:#4b5563; line-height:1.6;">
                      Entrez vos revenus et d&eacute;penses avec 8 options de fr&eacute;quence (hebdomadaire, aux 2 semaines, mensuel, etc.). PL4TO calcule votre balance en temps r&eacute;el et votre budget disponible par jour. Visualisez la r&eacute;partition par compte, identifiez vos d&eacute;penses fixes, semi-fixes et variables, et utilisez les r&egrave;gles d'optimisation pour voir l'impact de chaque ajustement.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature: GPS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8f7ff; border-radius:10px; padding:20px; border-left:4px solid #a855f7;">
                    <h3 style="margin:0 0 8px; font-size:16px; color:#1f2937;">
                      &#128205; GPS Financier
                    </h3>
                    <p style="margin:0; font-size:14px; color:#4b5563; line-height:1.6;">
                      Voyez la direction de votre portefeuille &mdash; jour par jour, mois par mois, ou sur le long terme. Recevez des alertes quand un compte risque le d&eacute;couvert, quand une carte approche sa limite, ou quand votre ch&egrave;que descend sous votre seuil de s&eacute;curit&eacute;. Confirmez vos transactions chaque jour pour garder votre trajectoire &agrave; jour.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature: Objectifs -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8f7ff; border-radius:10px; padding:20px; border-left:4px solid #c084fc;">
                    <h3 style="margin:0 0 8px; font-size:16px; color:#1f2937;">
                      &#127919; Objectifs financiers
                    </h3>
                    <p style="margin:0; font-size:14px; color:#4b5563; line-height:1.6;">
                      Cr&eacute;ez vos objectifs (fonds d'urgence, remboursement de dette, &eacute;pargne voyage, etc.), liez-les &agrave; un compte, et suivez votre progression en temps r&eacute;el avec une date estim&eacute;e d'atteinte calcul&eacute;e automatiquement.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature: Coach O -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#fefce8; border-radius:10px; padding:20px; border-left:4px solid #eab308;">
                    <h3 style="margin:0 0 8px; font-size:16px; color:#1f2937;">
                      &#129302; Coach O &mdash; Votre coach financier IA
                    </h3>
                    <p style="margin:0; font-size:14px; color:#4b5563; line-height:1.6;">
                      Posez vos questions financi&egrave;res directement dans l'application et recevez des recommandations personnalis&eacute;es bas&eacute;es sur votre situation r&eacute;elle.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none; border-top:2px solid #e5e7eb; margin:28px 0;">

              <!-- After 14 days -->
              <h2 style="font-size:18px; color:#4b5563; margin:0 0 16px;">
                Apr&egrave;s 14 jours &mdash; Plan Essentiel
              </h2>

              <p style="font-size:14px; color:#4b5563; line-height:1.8; margin:0 0 24px;">
                Vous conserverez l'acc&egrave;s &agrave; toutes les fonctionnalit&eacute;s de base :<br>
                &#128188; Portefeuille complet (tous les types de comptes, int&eacute;r&ecirc;ts, seuil de s&eacute;curit&eacute;)<br>
                &#128203; Budget avec calcul de balance en temps r&eacute;el<br>
                &#128205; GPS Financier avec alertes et confirmation de transactions<br>
                &#127919; Objectifs avec suivi de progression
              </p>

              <!-- Divider -->
              <hr style="border:none; border-top:2px solid #e5e7eb; margin:28px 0;">

              <!-- How to start -->
              <h2 style="font-size:20px; color:#6366f1; margin:0 0 16px;">
                &#128640; Comment commencer
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0; font-size:15px; color:#1f2937; line-height:1.6;">
                    <strong style="color:#6366f1;">1.</strong> Connectez-vous sur <a href="https://app.pl4to.com" style="color:#6366f1; text-decoration:underline;">app.pl4to.com</a> avec votre adresse courriel
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:15px; color:#1f2937; line-height:1.6;">
                    <strong style="color:#6366f1;">2.</strong> Votre acc&egrave;s Pro + IA est d&eacute;j&agrave; activ&eacute;
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:15px; color:#1f2937; line-height:1.6;">
                    <strong style="color:#6366f1;">3.</strong> Commencez par ajouter vos comptes dans le Portefeuille
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:15px; color:#1f2937; line-height:1.6;">
                    <strong style="color:#6366f1;">4.</strong> Entrez votre budget mensuel
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:15px; color:#1f2937; line-height:1.6;">
                    <strong style="color:#6366f1;">5.</strong> Le GPS calculera automatiquement la direction de votre portefeuille
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; color:#6b7280; line-height:1.6; margin:0 0 8px;">
                Si vous avez des questions, r&eacute;pondez directement &agrave; ce courriel.
              </p>

              <p style="font-size:16px; color:#1f2937; margin:24px 0 0;">
                Bonne route! &#128739;
              </p>

              <p style="font-size:14px; color:#6b7280; margin:8px 0 0;">
                &mdash; L'&eacute;quipe PL4TO
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:20px 40px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                PL4TO &mdash; Le GPS pour ton portefeuille
              </p>
              <p style="margin:4px 0 0; font-size:12px; color:#9ca3af;">
                9558-7168 Qu&eacute;bec inc. &bull; L'&Eacute;piphanie, Qu&eacute;bec, Canada
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Texte brut du courriel ──
function generatePlainText() {
  return `
PL4TO — Le GPS pour ton portefeuille

Bonjour,

L'equipe PL4TO vous offre 14 jours d'acces gratuit au Plan Pro + IA, notre plan le plus complet, pour vous aider a reprendre le controle de votre situation financiere.

---

Ce que vous recevez — Plan Pro + IA (14 jours)

Portefeuille complet
Ajoutez tous vos comptes — cheque, epargne, cartes de credit, hypotheque, marge de credit, investissements et crypto. Configurez un seuil de securite sur votre compte cheque pour ne jamais descendre en dessous d'un montant que vous choisissez. Suivez les interets calcules automatiquement sur vos cartes de credit, votre hypotheque et votre epargne.

Budget intelligent
Entrez vos revenus et depenses avec 8 options de frequence (hebdomadaire, aux 2 semaines, mensuel, etc.). PL4TO calcule votre balance en temps reel et votre budget disponible par jour.

GPS Financier
Voyez la direction de votre portefeuille — jour par jour, mois par mois, ou sur le long terme. Recevez des alertes quand un compte risque le decouvert, quand une carte approche sa limite, ou quand votre cheque descend sous votre seuil de securite.

Objectifs financiers
Creez vos objectifs, liez-les a un compte, et suivez votre progression en temps reel avec une date estimee d'atteinte calculee automatiquement.

Coach O — Votre coach financier IA
Posez vos questions financieres directement dans l'application et recevez des recommandations personnalisees basees sur votre situation reelle.

---

Apres 14 jours — Plan Essentiel

Vous conserverez l'acces a toutes les fonctionnalites de base :
- Portefeuille complet
- Budget avec calcul de balance en temps reel
- GPS Financier avec alertes et confirmation de transactions
- Objectifs avec suivi de progression

---

Comment commencer

1. Connectez-vous sur app.pl4to.com avec votre adresse courriel
2. Votre acces Pro + IA est deja active
3. Commencez par ajouter vos comptes dans le Portefeuille
4. Entrez votre budget mensuel
5. Le GPS calculera automatiquement la direction de votre portefeuille

Si vous avez des questions, repondez directement a ce courriel.

Bonne route!

— L'equipe PL4TO
  `.trim();
}

async function main() {
  console.log('🎁 Activation Plan Pro + IA (14 jours)');
  console.log(`📧 Cible: ${TARGET_EMAIL}`);
  console.log('');

  // ── Étape 1 : Trouver et activer l'utilisateur ──
  try {
    let user = await prisma.user.findUnique({
      where: { email: TARGET_EMAIL },
      select: { id: true, email: true, prenom: true, subscriptionPlan: true, unlimitedAccess: true, trialActive: true }
    });

    if (!user) {
      // Essayer en minuscules
      user = await prisma.user.findUnique({
        where: { email: TARGET_EMAIL.toLowerCase() },
        select: { id: true, email: true, prenom: true, subscriptionPlan: true, unlimitedAccess: true, trialActive: true }
      });
    }

    if (!user) {
      console.log(`❌ Aucun compte trouvé pour ${TARGET_EMAIL}`);
      console.log('   L\'utilisateur doit d\'abord créer un compte sur app.pl4to.com');
      process.exit(1);
    }

    console.log(`👤 Utilisateur trouvé: ${user.prenom || 'N/A'} (${user.email})`);
    console.log(`   Plan actuel: ${user.subscriptionPlan || 'aucun'}`);
    console.log(`   Trial active: ${user.trialActive}`);
    console.log(`   Accès illimité: ${user.unlimitedAccess}`);
    console.log('');

    // Activer Pro + IA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        unlimitedAccess: true,
        subscriptionPlan: 'pro',
        planChosen: true,
        trialActive: true
      }
    });

    console.log('✅ Plan Pro + IA activé!');
    console.log('');

    // ── Étape 2 : Envoyer le courriel ──
    console.log('📧 Envoi du courriel...');

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TARGET_EMAIL],
      replyTo: 'jhon.desir@pl4to.com',
      subject: 'PL4TO vous offre 14 jours d\'accès complet — Prenez le contrôle de vos finances',
      html: generateEmailHTML(),
      text: generatePlainText()
    });

    if (error) {
      console.error('❌ Erreur envoi courriel:', error);
      process.exit(1);
    }

    console.log(`✅ Courriel envoyé! (Resend ID: ${data.id})`);
    console.log('');
    console.log('📋 Résumé:');
    console.log(`   👤 ${user.prenom || 'N/A'} (${TARGET_EMAIL})`);
    console.log('   🎁 Plan Pro + IA activé (14 jours)');
    console.log('   📧 Courriel d\'invitation envoyé');
    console.log('');
    console.log('⚠️  RAPPEL: Dans 14 jours, exécuter le downgrade vers Essential:');
    console.log('   → Mettre subscriptionPlan = "essential"');
    console.log('   → Garder unlimitedAccess = true');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    console.error(err);
  }

  process.exit();
}

main();

import { Resend } from "resend";

// Initialise le client Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoie un email de vérification avec le lien contenant le token
 */
export async function sendVerificationEmail(email, username, token) {
  // Construction de l'URL de vérification (domaine + token)
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  try {
    // Envoi de l'email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email, // Destinataire
      subject: "Vérifiez votre adresse email - FitBuilder",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f4f4f4;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #260d87;
              margin: 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #260d87;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1f0a6d;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #FEF3C7;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              border-left: 4px solid #F59E0B;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏋️ FitBuilder</h1>
            </div>
            
            <div class="content">
              <h2>Bienvenue ${username} !</h2>
              <p>Merci de vous être inscrit sur FitBuilder. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                  Vérifier mon email
                </a>
              </div>
              
              <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #260d87;">
                ${verificationUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien expirera dans 24 heures. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.
              </div>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} FitBuilder. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Bienvenue ${username} !

Merci de vous être inscrit sur FitBuilder.

Cliquez sur ce lien pour vérifier votre email :
${verificationUrl}

Ce lien expire dans 24 heures.

---
FitBuilder - ${new Date().getFullYear()}
  `, // ← Version texte brut
    });

    // Gestion des erreurs Resend
    if (error) {
      console.error("❌ Erreur envoi email Resend:", error);
      throw new Error("Échec de l'envoi de l'email de vérification");
    }

    console.log("✅ Email de vérification envoyé:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("❌ Exception lors de l'envoi d'email:", error);
    throw error; // Propage l'erreur pour gestion dans la route API
  }
}

/**
 * Envoie un email de renvoi de vérification (template personnalisé)
 */
export async function sendResendVerificationEmail(email, username, token) {
  // Construction de l'URL de vérification
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  try {
    // Envoi de l'email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Nouveau lien de vérification - FitBuilder",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f4f4f4;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #260d87;
              margin: 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #260d87;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1f0a6d;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            .info-box {
              background-color: #DBEAFE;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              border-left: 4px solid #3B82F6;
            }
            .warning {
              background-color: #FEF3C7;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              border-left: 4px solid #F59E0B;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏋️ FitBuilder</h1>
            </div>
            
            <div class="content">
              <h2>Bonjour ${username} !</h2>
              <p>Vous avez demandé un nouveau lien de vérification pour votre compte FitBuilder.</p>
              
              <div class="info-box">
                <strong>ℹ️ Pourquoi cet email ?</strong><br>
                Vous ou quelqu'un d'autre avez demandé à renvoyer l'email de vérification pour votre compte.
              </div>
              
              <p style="margin-top: 20px;">Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                  Vérifier mon email maintenant
                </a>
              </div>
              
              <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #260d87; font-size: 14px;">
                ${verificationUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important :</strong> Ce nouveau lien expirera dans 24 heures et remplace l'ancien lien. Si vous n'avez pas demandé ce renvoi, vous pouvez ignorer cet email en toute sécurité.
              </div>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} FitBuilder. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Bonjour ${username} !

Vous avez demandé un nouveau lien de vérification pour votre compte FitBuilder.

Cliquez sur ce lien pour vérifier votre email :
${verificationUrl}

Ce lien expire dans 24 heures et remplace l'ancien.

Si vous n'avez pas demandé ce renvoi, ignorez cet email.

---
FitBuilder - ${new Date().getFullYear()}
      `,
    });

    // Gestion des erreurs Resend
    if (error) {
      console.error("❌ Erreur envoi email Resend:", error);
      throw new Error("Échec du renvoi de l'email de vérification");
    }

    console.log("✅ Email de renvoi envoyé:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("❌ Exception lors du renvoi d'email:", error);
    throw error;
  }
}

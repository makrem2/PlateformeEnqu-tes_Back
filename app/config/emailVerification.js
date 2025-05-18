exports.emailVerification = (username, verificationLink, verificationCode) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            h2 { color: #4CAF50; }
            p { font-size: 16px; line-height: 1.6; }
            .btn { display: inline-block; background-color: #4CAF50; color: #ffffff; font-size: 16px; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .btn:hover { background-color: #45a049; }
            .verification-code { background-color: #f0f0f0; border: 1px solid #ddd; padding: 10px; font-size: 18px; font-weight: bold; color: #333; display: inline-block; margin-top: 20px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Bonjour ${username},</h2>
            <p>Merci de vous être inscrit chez nous ! Veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous:</p>
            <a href="${verificationLink}" class="btn">Vérifier l'adresse e-mail</a>
            <p>Ou entrez le code de vérification manuellement:</p>
            <div class="verification-code">${verificationCode}</div>
  
            <p>Si vous ne vous êtes pas inscrit à ce compte, veuillez ignorer cet e-mail.</p>
            <p>Bonnes salutations,<br>National Statistics Institute</p>
          </div>
        </body>
      </html>`;
  };
  
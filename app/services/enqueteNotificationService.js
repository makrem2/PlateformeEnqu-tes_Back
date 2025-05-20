const sendMail = require("../config/SendEmail");

exports.sendEnqueteReminder = async (email, username, enquete) => {
  const subject = `🕒 Rappel : réponse à l'enquête "${enquete.titre}"`;

  const html = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        h2 { color: #007BFF; border-bottom: 2px solid #007BFF; padding-bottom: 10px; }
        .info-box { background-color: #f1f3f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .info-label { color: #6c757d; font-size: 0.9em; }
        .info-content { font-size: 1.1em; margin-top: 5px; }
        .footer { margin-top: 30px; color: #6c757d; font-size: 0.9em; }
                  .btn {
            display: inline-block;
            background-color: #007BFF;
            color: #ffffff;
            padding: 12px 24px;
            margin-top: 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
          .btn:hover {
            background-color: #0056b3;
          }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Bonjour ${username},</h2>
        <p>Un rappel pour vous informer que l’enquête intitulée <strong>"${
          enquete.titre
        }"</strong> se termine bientôt.</p>
        <div class="info-box">
          <div class="info-label">Date limite de réponse</div>
          <div class="info-content">${new Date(
            enquete.dateFin
          ).toLocaleDateString()}</div>
        </div>
        <p>En attendant, voici le lien pour y répondre : </p>
          <a href="http://localhost:4200/entreprise/enquetes-re%C3%A7ues?id=${
            enquete.enquete_id
          }" class="btn">📋 Répondre à l’enquête</a>
        <p>Merci de bien vouloir y répondre avant la date indiquée. Votre retour est précieux.</p>
        <p>Si vous avez des questions ou besoin d’aide, n’hésitez pas à nous contacter.</p>
        <div class="footer">
          <p>Cordialement,<br>
          <strong>L'équipe Enquêtes</strong></p>

          <p style="margin-top: 20px;">
            <small>
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
              © ${new Date().getFullYear()} National Statistics Institute
            </small>
          </p>
        </div>
      </div>
    </body>
  </html>
  `;

  return await sendMail(email, subject, html);
};

exports.sendEnqueteClosure = async (email, username, enquete) => {
  const subject = `📌 Clôture de l’enquête "${enquete.titre}"`;

  const html = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        h2 { color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px; }
        .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .info-label { color: #6c757d; font-size: 0.9em; }
        .info-content { font-size: 1.1em; margin-top: 5px; }
        .footer { margin-top: 30px; color: #6c757d; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Bonjour ${username},</h2>
        <p>L'enquête <strong>"${
          enquete.titre
        }"</strong> a été clôturée le <strong>${new Date(
    enquete.dateFin
  ).toLocaleDateString()}</strong>.</p>
        <p>Merci pour votre participation et votre implication.</p>

        <div class="footer">
          <p>Cordialement,<br>
          <strong>L'équipe Enquêtes</strong></p>

          <p style="margin-top: 20px;">
            <small>
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
              © ${new Date().getFullYear()} National Statistics Institute
            </small>
          </p>
        </div>
      </div>
    </body>
  </html>
  `;

  return await sendMail(email, subject, html);
};

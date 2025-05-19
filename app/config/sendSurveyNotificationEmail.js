exports.sendSurveyNotificationEmail = (
  entrepriseName,
  enqueteTitre,
  deadline,
  surveyLink
) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #007BFF;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
          }
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
          .footer {
            font-size: 13px;
            color: #999;
            margin-top: 30px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Bonjour ${entrepriseName},</h2>
          <p>Une nouvelle enquête intitulée <strong>"${enqueteTitre}"</strong> vous a été attribuée.</p>
          <p>Merci de bien vouloir y répondre avant le <strong>${deadline}</strong>.</p>

          <a href="${surveyLink}" class="btn">📋 Répondre à l’enquête</a>

          <p>Si vous avez des questions ou besoin d’assistance, n’hésitez pas à nous contacter.</p>

          <p>Cordialement,<br><strong>Institut National de Statistique</strong></p>

          <div class="footer">
            © ${new Date().getFullYear()} Institut National de Statistique. Tous droits réservés.
          </div>
        </div>
      </body>
    </html>
  `;
};

const sendMail = require("../config/SendEmail");

exports.sendEnqueteReminder = async (email, username, enquete) => {
  const subject = `🕒 Rappel : réponse à l'enquête avant demain`;
  const html = `
    <p>Bonjour ${username},</p>
    <p>Veuillez répondre à l'enquête <strong>${enquete.titre}</strong> avant <strong>${enquete.date_limite.toLocaleDateString()}</strong>.</p>
    <p>Merci pour votre collaboration.</p>
  `;
  return await sendMail(email, subject, html);
};

exports.sendEnqueteClosure = async (email, username, enquete) => {
  const subject = `📌 Clôture : enquête terminée`;
  const html = `
    <p>Bonjour ${username},</p>
    <p>L'enquête <strong>${enquete.titre}</strong> a été clôturée le <strong>${enquete.date_limite.toLocaleDateString()}</strong>.</p>
    <p>Merci pour votre participation.</p>
  `;
  return await sendMail(email, subject, html);
};

const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const {
  sendEnqueteReminder,
  sendEnqueteClosure,
} = require("../services/enqueteNotificationService");

const setupEnqueteJobs = () => {
  // Tous les jours à 20h
  //cron.schedule("*/1 * * * *", sendRemindersRendezvous);
  cron.schedule("*/1 * * * *", async () => {
    console.log("[CRON] Job démarré : Rappel + Clôture des enquêtes");
    try {
      await sendEnqueteReminders();
      await closeExpiredEnquetes();
      console.log("[CRON] Job terminé avec succès");
    } catch (error) {
      console.error(
        "[CRON] Erreur lors de l'exécution des jobs :",
        error.message
      );
    }
  });
};
const sendEnqueteReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const startDate = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endDate = new Date(tomorrow.setHours(23, 59, 59, 999));

    const enquetes = await db.enquete.findAll({
      where: {
        dateFin: {
          [Op.between]: [startDate, endDate],
        },
        statut: "EN_COURS",
      },
      include: [
        {
          model: db.entreprise,
          as: "entreprises",
          through: { attributes: [] },
          include: [{ model: db.user, attributes: ["email", "username"] }],
        },
      ],
    });

    for (const enquete of enquetes) {
      for (const entreprise of enquete.entreprises) {
        const user = entreprise.user;
        if (user?.email) {
          await sendEnqueteReminder(user.email, user.username, enquete);
          console.log(
            `[CRON] Rappel envoyé à ${user.email} pour enquête "${enquete.titre}"`
          );
        }
      }
    }
  } catch (error) {
    console.error("[CRON] Erreur dans sendEnqueteReminders :", error.message);
  }
};
const closeExpiredEnquetes = async () => {
  try {
    const now = new Date();

    const enquetes = await db.enquete.findAll({
      where: {
        dateFin: {
          [Op.lt]: now,
        },
        statut: "EN_COURS",
      },
      include: [
        {
          model: db.entreprise,
          as: "entreprises",
          through: { attributes: [] },
          include: [{ model: db.user, attributes: ["email", "username"] }],
        },
      ],
    });

    for (const enquete of enquetes) {
      enquete.statut = "CLOTUREE";
      await enquete.save();

      for (const entreprise of enquete.entreprises) {
        const user = entreprise.user;
        if (user?.email) {
          await sendEnqueteClosure(user.email, user.username, enquete);
          console.log(
            `[CRON] Clôture notifiée à ${user.email} pour enquête "${enquete.titre}"`
          );
        }
      }
    }
  } catch (error) {
    console.error("[CRON] Erreur dans closeExpiredEnquetes :", error.message);
  }
};
module.exports = setupEnqueteJobs;

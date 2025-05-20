const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const {
  sendEnqueteReminder,
  sendEnqueteClosure,
} = require("../services/enqueteNotificationService");

const setupEnqueteJobs = () => {
  cron.schedule("0 10 * * *", async () => {
    console.log("[CRON] Envoi des rappels d'enquête à 10h...");
    await sendEnqueteReminders();
  });

  cron.schedule("*/1 * * * *", async () => {
    console.log("[CRON] Vérification des enquêtes expirées...");
    await closeExpiredEnquetes();
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
        const reponses = await db.reponse.findAll({
          where: {
            entreprise_id: entreprise.id,
            enquete_id: enquete.enquete_id,
          },
        });

        // Si aucune réponse n’a été donnée, on envoie le rappel
        if (reponses.length === 0) {
          const user = entreprise.user;
          if (user?.email) {
            await sendEnqueteReminder(user.email, user.username, enquete);
            console.log(
              `[CRON] Rappel envoyé à ${user.email} pour enquête "${enquete.titre}"`
            );
          }
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
          include: [
            {
              model: db.user,
              attributes: ["email", "username"],
            },
          ],
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

    if (enquetes.length === 0) {
      console.log("[CRON] Aucune enquête à clôturer pour l'instant.");
    }
  } catch (error) {
    console.error("[CRON] Erreur dans closeExpiredEnquetes :", error.message);
  }
};

module.exports = setupEnqueteJobs;

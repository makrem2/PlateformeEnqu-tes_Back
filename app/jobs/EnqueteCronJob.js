const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const {
  sendEnqueteReminder,
  sendEnqueteClosure,
} = require("../services/enqueteNotificationService");

const setupEnqueteJobs = () => {
  // Tous les jours à 20h
  cron.schedule("0 20 * * *", async () => {
    await sendEnqueteReminders();
    await closeExpiredEnquetes();
  });
};

const sendEnqueteReminders = async () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const startDate = new Date(tomorrow.setHours(0, 0, 0, 0));
  const endDate = new Date(tomorrow.setHours(23, 59, 59, 999));

  const enquetes = await db.enquete.findAll({
    where: {
      deadline: {
        [Op.between]: [startDate, endDate],
      },
      statut: "active",
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
      if (user && user.email) {
        await sendEnqueteReminder(user.email, user.username, enquete);
      }
    }
  }
};

const closeExpiredEnquetes = async () => {
  const now = new Date();

  const enquetes = await db.enquete.findAll({
    where: {
      deadline: {
        [Op.lt]: now,
      },
      statut: "active",
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
    enquete.statut = "cloturee";
    await enquete.save();

    for (const entreprise of enquete.entreprises) {
      const user = entreprise.user;
      if (user && user.email) {
        await sendEnqueteClosure(user.email, user.username, enquete);
      }
    }
  }
};

module.exports = setupEnqueteJobs;

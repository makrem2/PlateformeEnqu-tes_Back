const db = require("../models");
const { Op } = require("sequelize");

const Reponse = db.reponse;
const Enquete = db.enquete;

exports.getEntrepriseStats = async (req, res) => {
  const entrepriseId = req.params.entrepriseId;

  try {
    const totalReçues = await Enquete.count();
    const reponses = await Reponse.findAll({
      where: { entreprise_id: entrepriseId },
    });
    const totalRépondues = new Set(reponses.map((r) => r.enquete_id)).size;

    const tauxReponse =
      totalReçues > 0 ? ((totalRépondues / totalReçues) * 100).toFixed(2) : 0;

    res.status(200).json({
      totalReçues,
      totalRépondues,
      tauxReponse,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

exports.getReponsesParType = async (req, res) => {
  const entrepriseId = req.params.entrepriseId;

  try {
    const results = await Reponse.findAll({
      attributes: [
        [sequelize.col("Enquete.type"), "type"],
        [sequelize.fn("COUNT", sequelize.col("Reponse.id")), "total"],
      ],
      include: [
        {
          model: Enquete,
          attributes: [],
          where: { entrepriseId },
        },
      ],
      group: ["Enquete.type"],
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur getReponsesParType:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getReponsesMensuelles = async (req, res) => {
  const entrepriseId = req.params.entrepriseId;

  try {
    const results = await Reponse.findAll({
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("Reponse.createdAt")), "mois"],
        [sequelize.fn("COUNT", sequelize.col("Reponse.id")), "total"],
      ],
      include: [
        {
          model: Enquete,
          attributes: [],
          where: { entrepriseId },
        },
      ],
      group: ["mois"],
      order: [[sequelize.literal("mois"), "ASC"]],
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur getReponsesMensuelles:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

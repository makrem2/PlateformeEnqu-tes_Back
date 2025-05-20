const db = require("../models");
const { sequelize, fn, col, literal } = require("sequelize");

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
  try {
    const entrepriseId = req.params.entrepriseId;

    const results = await Reponse.findAll({
      attributes: [
        [col("Enquete.type"), "type"],
        // Count distinct pairs (enquete_id, entreprise_id)
        [
          fn(
            "COUNT",
            literal(
              'DISTINCT CONCAT(reponse.enquete_id, "-", reponse.entreprise_id)'
            )
          ),
          "totalEntreprisesRepondues",
        ],
      ],
      include: [
        {
          model: Enquete,
          attributes: [],
        },
      ],
      where: entrepriseId ? { entreprise_id: entrepriseId } : undefined,
      group: ["Enquete.type"],
      raw: true,
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur getReponsesParType:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getReponsesMensuelles = async (req, res) => {
  const entrepriseId = req.params.entrepriseId;

  const moisNoms = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  try {
    const results = await Reponse.findAll({
      attributes: [
        [fn("MONTH", col("Reponse.createdAt")), "mois"],
        [fn("COUNT", fn("DISTINCT", col("Reponse.enquete_id"))), "total"],
      ],
      where: {
        entreprise_id: entrepriseId,
      },
      include: [
        {
          model: Enquete,
          attributes: [],
        },
      ],
      group: ["mois"],
      order: [[literal("mois"), "ASC"]],
      raw: true,
    });

    const resultsAvecNomMois = results.map((item) => ({
      mois: moisNoms[item.mois - 1],
      total: item.total,
    }));

    res.status(200).json(resultsAvecNomMois);
  } catch (error) {
    console.error("Erreur getReponsesMensuelles:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

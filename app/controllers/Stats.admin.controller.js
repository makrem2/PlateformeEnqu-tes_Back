const db = require("../models");
const { Op, fn, col, literal, sequelize } = require("sequelize");

const Reponse = db.reponse;
const Enquete = db.enquete;
const Entreprise = db.entreprise;

exports.getAdminStats = async (req, res) => {
  try {
    const totalEnquetes = await Enquete.count();
    const totalEntreprises = await Entreprise.count();
    const totalReponses = await Reponse.count();

    // Pourcentage de réponses = (nb réponses / nb total enquêtes * nb entreprises) * 100
    const totalEnquetesEntreprises = totalEnquetes * totalEntreprises;
    const tauxReponse =
      totalEnquetesEntreprises > 0
        ? ((totalReponses / totalEnquetesEntreprises) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      totalEnquetes,
      totalEntreprises,
      totalReponses,
      tauxReponse,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

exports.getTotalEnquetesParEntreprise = async (req, res) => {
  try {
    const result = await Entreprise.findAll({
      attributes: [
        "id",
        "nom", // si tu veux le nom de l'entreprise aussi
        [fn("COUNT", col("Enquetes.enquete_id")), "totalEnquetes"],
      ],
      include: [
        {
          model: Enquete,
          attributes: [],
          through: { attributes: [] }, // ne retourne pas les données de la table associative
        },
      ],
      group: ["id"],
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur getTotalEnquetesParEntreprise:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getTauxReponseParEntreprise = async (req, res) => {
  try {
    // 1. Total enquêtes par entreprise (many-to-many)
    const totalEnquetes = await Entreprise.findAll({
      attributes: ["id", [fn("COUNT", col("Enquetes.enquete_id")), "nbEnquetes"]],
      include: [
        {
          model: Enquete,
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["id"],
      raw: true,
    });

    // 2. Total réponses par entreprise (via Enquete → table associative)
    const totalReponses = await Entreprise.findAll({
      attributes: [
        "id",
        [fn("COUNT", col("Enquetes->Reponses.reponse_id")), "nbReponses"],
      ],
      include: [
        {
          model: Enquete,
          attributes: [],
          through: { attributes: [] },
          include: [
            {
              model: Reponse,
              attributes: [],
            },
          ],
        },
      ],
      group: ["id"],
      raw: true,
    });

    // 3. Calcul du taux
    const result = totalEnquetes.map((e) => {
      const matching = totalReponses.find((r) => r.id === e.id);
      const nbReponses = matching ? parseInt(matching.nbReponses) : 0;
      const nbEnquetes = parseInt(e.nbEnquetes);
      const taux = nbEnquetes > 0 ? (nbReponses / nbEnquetes) * 100 : 0;

      return {
        entrepriseId: e.id,
        tauxReponse: Math.round(taux * 100) / 100,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur getTauxReponseParEntreprise:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

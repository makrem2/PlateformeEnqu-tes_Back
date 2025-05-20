const db = require("../models");
const { Op, fn, col, literal, sequelize } = require("sequelize");

const Reponse = db.reponse;
const Enquete = db.enquete;
const Entreprise = db.entreprise;

exports.getAdminStats = async (req, res) => {
  try {
    const totalEnquetes = await Enquete.count();
    const totalEntreprises = await Entreprise.count();

    // Nombre de réponses = nombre de couples uniques (enquete_id, entreprise_id)
    const totalReponses = await Reponse.count({
      distinct: true,
      col: "enquete_id",
      include: [
        {
          model: Enquete,
          attributes: [],
        },
      ],
      // On peut aussi le faire plus précisément avec une requête brute si besoin
    });

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
    // Étape 1 : Total des enquêtes par entreprise (many-to-many)
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

    // Étape 2 : Récupérer toutes les réponses avec entreprise_id et enquete_id
    const reponses = await Reponse.findAll({
      attributes: ["entreprise_id", "enquete_id"],
      group: ["entreprise_id", "enquete_id"],
      raw: true,
    });

    // Transformer en Map { entrepriseId -> count unique (enquete_id) }
    const reponsesParEntreprise = {};
    reponses.forEach((rep) => {
      const id = rep.entreprise_id;
      if (!reponsesParEntreprise[id]) {
        reponsesParEntreprise[id] = new Set();
      }
      reponsesParEntreprise[id].add(rep.enquete_id);
    });

    // Étape 3 : Récupérer noms des entreprises (pour affichage)
    const entreprises = await Entreprise.findAll({
      attributes: ["id", "nom"],
      raw: true,
    });

    // Étape 4 : Combiner tout
    const result = totalEnquetes.map((e) => {
      const nbEnquetes = parseInt(e.nbEnquetes);
      const nbReponses = reponsesParEntreprise[e.id]?.size || 0;
      const taux = nbEnquetes > 0 ? (nbReponses / nbEnquetes) * 100 : 0;

      const nomEntreprise =
        entreprises.find((ent) => ent.id === e.id)?.nom || "";

      return {
        entrepriseId: e.id,
        nom: nomEntreprise,
        tauxReponse: Math.round(taux * 100) / 100,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur getTauxReponseParEntreprise:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

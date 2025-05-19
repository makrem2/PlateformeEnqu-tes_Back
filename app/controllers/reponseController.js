const db = require("../models");
const Reponse = db.reponse;
const { Op } = require("sequelize");

// Créer une réponse (initiale ou soumise)
exports.createReponse = async (req, res) => {
  try {
    const { valeur, dateSoumission, statut, question_id, entreprise_id , enquete_id  } =
      req.body;

    const nouvelleReponse = await Reponse.create({
      valeur,
      dateSoumission,
      statut: statut || "EN_ATTENTE",
      question_id,
      entreprise_id,
      enquete_id
    });

    return res.status(201).json(nouvelleReponse);
  } catch (error) {
    console.error("Erreur lors de la création de la réponse :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer toutes les réponses (avec pagination)
exports.getAllReponses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Reponse.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      reponses: rows,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réponses :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer une réponse par ID
exports.getReponseById = async (req, res) => {
  try {
    const reponse = await Reponse.findByPk(req.params.id);

    if (!reponse) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    return res.status(200).json(reponse);
  } catch (error) {
    console.error("Erreur lors de la récupération de la réponse :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour une réponse
exports.updateReponse = async (req, res) => {
  try {
    const { valeur, dateSoumission, statut } = req.body;

    const reponse = await Reponse.findByPk(req.params.id);
    if (!reponse) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    await reponse.update({ valeur, dateSoumission, statut });

    return res.status(200).json(reponse);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réponse :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une réponse
exports.deleteReponse = async (req, res) => {
  try {
    const reponse = await Reponse.findByPk(req.params.id);
    if (!reponse) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    await reponse.destroy();
    return res.status(200).json({ message: "Réponse supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la réponse :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

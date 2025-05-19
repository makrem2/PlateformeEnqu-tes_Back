const { Reponse } = require("../models");
const { Op } = require("sequelize");

exports.createReponses = async (req, res) => {
  const { entreprise_id, enquete_id, reponses } = req.body;

  if (!entreprise_id || !enquete_id || !Array.isArray(reponses)) {
    return res
      .status(400)
      .json({ message: "Champs requis manquants ou invalides." });
  }

  try {
    // Vérifier si l'entreprise a déjà soumis des réponses pour cette enquête
    const existingReponses = await Reponse.findOne({
      where: { entreprise_id, enquete_id },
    });

    if (existingReponses) {
      return res.status(409).json({
        message:
          "Cette entreprise a déjà soumis des réponses pour cette enquête.",
      });
    }

    // Créer les réponses
    const createdReponses = await Promise.all(
      reponses.map((r) =>
        Reponse.create({
          entreprise_id,
          enquete_id,
          question_id: r.question_id,
          valeur: r.valeur,
          dateSoumission: new Date(),
          statut: "EN_ATTENTE",
        })
      )
    );

    return res.status(201).json({
      message: "Réponses enregistrées avec succès.",
      data: createdReponses,
    });
  } catch (error) {
    console.error("Erreur lors de la création des réponses :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getReponsesByEnqueteAndEntreprise = async (req, res) => {
  const { enquete_id, entreprise_id } = req.params;

  try {
    const reponses = await Reponse.findAll({
      where: {
        enquete_id,
        entreprise_id,
      },
    });

    return res.status(200).json(reponses);
  } catch (error) {
    console.error("Erreur lors de la récupération des réponses :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.deleteReponse = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Reponse.destroy({ where: { reponse_id: id } });

    if (!deleted) {
      return res.status(404).json({ message: "Réponse non trouvée." });
    }

    return res.status(200).json({ message: "Réponse supprimée avec succès." });
  } catch (error) {
    console.error("Erreur suppression réponse :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.updateReponse = async (req, res) => {
  const { id } = req.params;
  const { valeur, statut } = req.body;

  try {
    const reponse = await Reponse.findByPk(id);
    if (!reponse) {
      return res.status(404).json({ message: "Réponse non trouvée." });
    }

    reponse.valeur = valeur || reponse.valeur;
    reponse.statut = statut || reponse.statut;

    await reponse.save();

    return res
      .status(200)
      .json({ message: "Réponse mise à jour.", data: reponse });
  } catch (error) {
    console.error("Erreur update réponse :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

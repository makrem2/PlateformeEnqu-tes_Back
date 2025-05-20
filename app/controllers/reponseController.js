const db = require("../models");
const { Op } = require("sequelize");

const Reponse = db.reponse;
const Enquete = db.enquete;

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

exports.getEnquetesRepondues = async (req, res) => {
  try {
    const { entrepriseId } = req.params;

    // Récupère toutes les réponses de l'entreprise avec les données d'enquête associées
    const reponses = await Reponse.findAll({
      where: { entreprise_id: entrepriseId },
      include: [
        {
          model: Enquete,
          attributes: [
            "enquete_id",
            "titre",
            "description",
            "type",
            "dateDebut",
            "dateFin",
            "statut",
          ],
        },
      ],
      group: ["enquete_id"],
    });

    // Extraire les enquêtes répondues
    const enquetesRepondues = reponses
      .map((rep) => rep.enquete)
      .filter(
        (enq, index, self) =>
          enq &&
          self.findIndex((e) => e.enquete_id === enq.enquete_id) === index
      );

    return res.status(200).json(enquetesRepondues);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des enquêtes répondues:",
      error
    );
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getDerniereEnqueteRepondue = async (req, res) => {
  try {
    const { entrepriseId } = req.params;

    const derniereReponse = await Reponse.findOne({
      where: {
        entreprise_id: entrepriseId,
      },
      include: [
        {
          model: Enquete,
          attributes: [
            "enquete_id",
            "titre",
            "description",
            "type",
            "dateDebut",
            "dateFin",
            "statut",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!derniereReponse || !derniereReponse.enquete) {
      return res
        .status(404)
        .json({ message: "Aucune enquête répondue trouvée." });
    }

    // return res.status(200).json(derniereReponse);
    return res.status(200).json(derniereReponse.enquete);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la dernière enquête répondue:",
      error
    );
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getAllEnquetesRepondues = async (req, res) => {
  const entrepriseId = req.params.entrepriseId;

  try {
    // Récupérer les IDs d'enquêtes auxquelles cette entreprise a répondu
    const reponses = await Reponse.findAll({
      where: { entreprise_id: entrepriseId },
      attributes: ["enquete_id"],
      group: ["enquete_id"],
    });

    const enqueteIds = reponses.map((r) => r.enquete_id);

    if (enqueteIds.length === 0) {
      return res.status(200).json([]);
    }

    // Récupérer les enquêtes associées
    const enquetes = await Enquete.findAll({
      where: { enquete_id: enqueteIds },
    });

    res.status(200).json(enquetes);
  } catch (error) {
    console.error("Erreur getAllEnquetesRepondues:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const db = require("../models");
const Question = db.question;
const { Op } = require("sequelize");

// Créer une nouvelle question
exports.createQuestion = async (req, res) => {
  try {
    const { texte, type, options,enquete_id } = req.body;

    const newQuestion = await Question.create({ texte, type, options,enquete_id });
    return res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Erreur lors de la création de la question:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer toutes les questions (avec pagination)
exports.getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Question.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      questions: rows,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des questions:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer une question par ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }

    return res.status(200).json(question);
  } catch (error) {
    console.error("Erreur lors de la récupération de la question:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour une question
exports.updateQuestion = async (req, res) => {
  try {
    const { texte, type, options,enquete_id } = req.body;

    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }

    await question.update({ texte, type, options,enquete_id });

    return res.status(200).json(question);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }

    await question.destroy();

    return res.status(200).json({ message: "Question supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

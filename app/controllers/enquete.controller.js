const db = require("../models");
const { enquete, entreprise, user } = db;
const { Op } = require("sequelize");
const sendMail = require("../config/SendEmail");

exports.createEnquete = async (req, res) => {
  try {
    const { titre, description, date_limite, entrepriseIds } = req.body;

    // Vérification de base
    if (!titre || !description || !date_limite || !entrepriseIds?.length) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Création de l’enquête
    const nouvelleEnquete = await enquete.create({
      titre,
      description,
      date_limite,
      statut: "active",
    });

    // Lier les entreprises sélectionnées
    await nouvelleEnquete.setEntreprises(entrepriseIds);

    // Récupérer les emails pour notification immédiate
    const entreprisesCibles = await entreprise.findAll({
      where: { id: { [Op.in]: entrepriseIds } },
      include: [{ model: user, attributes: ["email", "username"] }],
    });

    // Envoi des mails
    for (const e of entreprisesCibles) {
      if (e.user?.email) {
        const html = `
          <p>Bonjour ${e.user.username},</p>
          <p>Une nouvelle enquête vous a été envoyée : <strong>${titre}</strong>.</p>
          <p>Merci de répondre avant le <strong>${new Date(date_limite).toLocaleDateString()}</strong>.</p>
          <p>Cordialement,<br>L'équipe</p>
        `;
        await sendMail(e.user.email, `📊 Nouvelle enquête : ${titre}`, html);
      }
    }

    return res.status(201).json({
      message: "Enquête créée et notifications envoyées.",
      enquete: nouvelleEnquete,
    });
  } catch (error) {
    console.error("Erreur création enquête:", error.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getAllEnquetes = async (req, res) => {
  try {
    const enquetes = await enquete.findAll({
      include: [
        {
          model: entreprise,
          as: "entreprises",
          through: { attributes: [] },
          include: [{ model: user, attributes: ["email", "username"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(enquetes);
  } catch (error) {
    console.error("Erreur récupération enquêtes:", error.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getEnqueteById = async (req, res) => {
  try {
    const { id } = req.params;
    const enqueteFound = await enquete.findByPk(id, {
      include: [
        {
          model: entreprise,
          as: "entreprises",
          through: { attributes: [] },
          include: [{ model: user, attributes: ["email", "username"] }],
        },
      ],
    });

    if (!enqueteFound) {
      return res.status(404).json({ message: "Enquête non trouvée." });
    }

    return res.status(200).json(enqueteFound);
  } catch (error) {
    console.error("Erreur récupération enquête:", error.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

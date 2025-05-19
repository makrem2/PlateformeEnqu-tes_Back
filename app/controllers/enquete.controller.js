const db = require("../models");
const Enquete = db.enquete;
const Entreprise = db.entreprise;

// Créer une nouvelle enquête
exports.createEnquete = async (req, res) => {
  try {
    const { titre, description, type, dateDebut, dateFin } = req.body;

    await Enquete.create({
      titre,
      description,
      type,
      dateDebut,
      dateFin,
    });

    res.status(201).json({ message: "Enquête créée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// Lister toutes les enquêtes
exports.getAllEnquetes = async (req, res) => {
  try {
    const enquetes = await Enquete.findAll();
    res.status(200).json(enquetes);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// Récupérer une enquête par ID
exports.getEnqueteById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquete = await Enquete.findByPk(id);

    if (!enquete)
      return res.status(404).json({ message: "Enquête introuvable" });

    res.status(200).json(enquete);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// Mettre à jour une enquête
exports.updateEnquete = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, type, dateDebut, dateFin, statut } = req.body;

    const updated = await Enquete.update(
      { titre, description, type, dateDebut, dateFin, statut },
      { where: { enquete_id: id } }
    );

    if (updated[0] === 0)
      return res.status(404).json({ message: "Enquête introuvable" });

    res.status(200).json({ message: "Enquête mise à jour" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// Assigner une enquête à plusieurs entreprises
exports.assignEnqueteToEntreprises = async (req, res) => {
  try {
    const { id } = req.params; // enquete_id
    const { entrepriseIds } = req.body; // tableau d'ID

    const enquete = await Enquete.findByPk(id);
    if (!enquete)
      return res.status(404).json({ message: "Enquête introuvable" });

    const entreprises = await Entreprise.findAll({
      where: { entreprise_id: entrepriseIds },
    });

    await enquete.addEntreprises(entreprises); // relation many-to-many

    res.status(200).json({ message: "Enquête assignée aux entreprises" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// Clôturer automatiquement les enquêtes expirées (à appeler par cron)
exports.clotureEnquetesAutomatique = async () => {
  try {
    const now = new Date();

    const enquetesExpirees = await Enquete.findAll({
      where: {
        dateFin: { [db.Sequelize.Op.lt]: now },
        statut: "EN_COURS",
      },
    });

    for (let enquete of enquetesExpirees) {
      enquete.statut = "CLOTUREE";
      await enquete.save();
      // → ici tu peux déclencher une fonction d'envoi email clôture
    }

    console.log(
      `Enquêtes clôturées automatiquement : ${enquetesExpirees.length}`
    );
  } catch (error) {
    console.error("Erreur clôture automatique :", error.message);
  }
};


exports.deleteEnquete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({ message: "ID requis." });
    }
    const enquete = await Enquete.findByPk(id);
    if (!enquete)
      return res.status(404).send({ message: "Enquete non trouvé." });

    await enquete.destroy();
    res.send({ message: "Enquete supprimé avec succès." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

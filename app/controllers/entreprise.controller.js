const db = require("../models");
const entreprise = db.entreprise;

exports.UpdateEntreprise = async (req, res) => {
  try {
    const user_id = req.params.id;
    const { nom, secteur, ville, pays } = req.body;
    if (!user_id) {
      return res.status(400).send({ message: "ID requis." });
    }
    const Entreprise = await entreprise.findOne({
      where: { user_id },
    });

    if (!Entreprise)
      return res.status(404).send({ message: "entreprise non trouvé." });

    Entreprise.secteur = secteur || Entreprise.secteur;
    Entreprise.ville = ville || Entreprise.ville;
    Entreprise.nom = nom || Entreprise.nom;
    Entreprise.pays = pays || Entreprise.pays;

    await Entreprise.save();

    return res.status(200).send({ message: "entreprise modifiée." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getOneEntreprise = async (req, res) => {
  try {
    const user_id = req.params.id;

    if (!user_id) {
      return res.status(400).send({ message: "ID requis." });
    }
    const entreprise_s = await entreprise.findOne({
      where: { user_id },
    });

    if (!entreprise_s)
      return res.status(404).send({ message: "Entreprise non trouvé." });

    res.send(entreprise_s);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.GetAllEntreprise = async (req, res) => {
  try {
    const entreprise_s = await entreprise.findAll({
      attributes: ["id", "nom"],
    });
    res.send(entreprise_s);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
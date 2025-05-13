const db = require("../models");
const config = require("../config/auth.config");
require("dotenv").config();
const { user, role, tokenBlacklist } = db;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendMail = require("../config/sendEmail");
const { emailVerification } = require("../config/emailVerification");
const sequelize = require("../models/index").sequelize;

exports.signup = async (req, res) => {
  let transaction;
  try {
    const requiredFields = [
      "username",
      "email",
      "telephone",
      "adresse",
      "password",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({ message: `Le champ ${field} est vide.` });
      }
    }

    transaction = await sequelize.transaction();

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Création de l'utilisateur
    const New_user = await user.create(
      {
        username: req.body.username,
        email: req.body.email,
        telephone: req.body.telephone,
        adresse: req.body.adresse,
        password: bcrypt.hashSync(req.body.password, 8),
        isVerified: false,
        verificationToken,
        verificationCode,
      },
      { transaction }
    );

    // Récupération des rôles (ou par défaut entreprise)
    const roles = await role.findAll({
      where: { name: { [Op.or]: req.body.roles || ["entreprise"] } },
      transaction,
    });

    await New_user.setRoles(roles, { transaction });

    // Si le rôle est "entreprise", on crée une entrée vide liée dans la table entreprise
    if (roles.some((r) => r.name === "entreprise")) {
      await db.entreprise.create(
        {
          user_id: New_user.user_id,
          nom: req.body.nom,
          secteur: req.body.secteur,
          ville:req.body.ville,
          pays: req.body.pays,
        },
        { transaction }
      );
    }

    // Envoi email de vérification
    const verificationLink = `http://localhost:4200/verify-email?token=${verificationToken}`;
    const htmlContent = emailVerification(
      New_user.username,
      verificationLink,
      verificationCode
    );

    await sendMail(New_user.email, "Email Verification", htmlContent);

    await transaction.commit();

    res.send({
      message:
        "Inscription réussie ! Vérifiez votre email pour activer votre compte.",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).send({ message: error.message });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token, verificationCode } = req.query;

    if (!token || !verificationCode) {
      return res.status(400).send({
        message: "Les champs token et verificationCode sont requis.",
      });
    }

    const verifi_user = await user.findOne({
      where: { verificationToken: token },
    });

    if (!verifi_user) {
      return res.status(400).send({ message: "Token invalide ou expiré." });
    }

    if (verifi_user.verificationCode != parseInt(verificationCode)) {
      return res
        .status(400)
        .send({ message: "Code de vérification incorrect." });
    }

    verifi_user.isVerified = true;
    verifi_user.verificationToken = null;
    verifi_user.verificationCode = null;
    await verifi_user.save();

    res.send({
      message:
        "Email vérifié avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};
exports.signin = async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res
        .status(400)
        .send({ message: "Les champs username et password sont requis." });
    }

    const users = await user.findOne({
      where: { username: req.body.username },
    });
    if (!users) {
      return res.status(404).send({ message: "Utilisateur non trouvé." });
    }

    if (!users.isVerified) {
      return res.status(401).send({
        message: "Veuillez vérifier votre email avant de vous connecter.",
      });
    }

    if (!users.is_active) {
      return res.status(401).send({
        message: "Votre compte est inactif. Contactez l'administrateur.",
      });
    }

    if (!bcrypt.compareSync(req.body.password, users.password)) {
      return res.status(401).send({ message: "Mot de passe incorrect !" });
    }

    const roles = await users.getRoles();
    const authorities = roles.map((role) => `ROLE_${role.name.toUpperCase()}`);

    const token = jwt.sign({ id: users.user_id }, config.secret, {
      algorithm: "HS256",
      allowInsecureKeySizes: true,
      expiresIn: 86400,
    });

    res.status(200).send({
      id: users.user_id,
      username: users.username,
      email: users.email,
      token,
      roles: authorities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};
exports.signout = async (req, res) => {
  const { token, userId } = req.body;

  if (!token || !userId) {
    return res.status(401).json({ message: "No token provided or User ID" });
  }

  const users = await user.findByPk(userId);
  if (!users) {
    return res.status(404).send("L'utilisateur n'a pas été trouvé.");
  }

  try {
    // Check if token is already blacklisted
    let tokenBlacklistEntry = await tokenBlacklist.findOne({
      where: { token: token },
    });

    if (!tokenBlacklistEntry) {
      await tokenBlacklist.create({ token: token });
      return res.status(200).json({ message: "Déconnexion réussie" });
    } else {
      return res.status(401).json({ message: "Token déjà sur liste noire" });
    }
  } catch (error) {
    return res.status(500).json({
      message:
        "Une erreur s'est produite lors du traitement de la demande de déconnexion",
    });
  }
};

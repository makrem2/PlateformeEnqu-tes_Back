const db = require("../models");
const bcrypt = require("bcryptjs");
const sendMail = require("../config/sendEmail");
const { user } = db;
const { Op } = require("sequelize");
const crypto = require("crypto");


// image Upload
const multer = require("multer");
const path = require("path");

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, nom, prenom, telephone, adresse } = req.body;

    const photo_profil = req.file ? req.file.path : null;

    if (!id) {
      return res.status(400).send({ message: "ID requis." });
    }
    const user_s = await user.findByPk(id);
    if (!user_s)
      return res.status(404).send({ message: "Utilisateur non trouvé." });

    user_s.username = username || user_s.username;
    user_s.email = email || user_s.email;
    user_s.nom = nom || user_s.nom;
    user_s.prenom = prenom || user_s.prenom;
    user_s.telephone = telephone || user_s.telephone;
    user_s.adresse = adresse || user_s.adresse;
    if (photo_profil) {
      user_s.photo_profil = photo_profil;
    }

    await user_s.save();
    res.send({ message: "Utilisateur mis à jour avec succès." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({ message: "ID requis." });
    }
    const user_s = await user.findByPk(id);
    if (!user_s)
      return res.status(404).send({ message: "Utilisateur non trouvé." });

    await user_s.destroy();
    res.send({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const users = await user.findAll({
      include:[{
        model:db.role
      }],
      limit: limit,
      offset: offset,
    });
    const totalUsers = await user.count({});
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for the specified role",
      });
    }

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: totalUsers,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users by role.",
      error: error.message,
    });
  }
};
exports.getOneUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({ message: "ID requis." });
    }
    const user_s = await user.findByPk(id);
    if (!user_s)
      return res.status(404).send({ message: "Utilisateur non trouvé." });

    res.send(user_s);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.toggleUserStatus = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({ message: "ID requis." });
    }
    const user_s = await user.findByPk(id);
    if (!user_s)
      return res.status(404).send({ message: "Utilisateur non trouvé." });

    user_s.is_active = !user_s.is_active;
    await user_s.save();

    res.send({
      message: `Utilisateur ${
        user_s.is_active ? "activé" : "désactivé"
      } avec succès.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user_s = await user.findOne({ where: { email } });

    if (!user_s) {
      return res.status(404).send({ message: "Email non trouvé." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    user_s.resetToken = resetToken;
    user_s.resetTokenExpiry = resetTokenExpiry;
    await user_s.save();

    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
    const subject = "Demande de réinitialisation du mot de passe";
    let htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f9f9f9;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h2 {
              color: #4CAF50;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
            }
            .btn {
              display: inline-block;
              background-color: #4CAF50;
              color: #ffffff;
              font-size: 16px;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              margin-top: 20px;
            }
            .btn:hover {
              background-color: #45a049;
            }
            .verification-code {
              background-color: #f0f0f0;
              border: 1px solid #ddd;
              padding: 10px;
              font-size: 18px;
              font-weight: bold;
              color: #333;
              display: inline-block;
              margin-top: 20px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Bonjour ${user_s.username},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez utiliser le lien ci-dessous pour réinitialiser votre mot de passe :</p>
            <a href="${resetLink}" class="btn">Réinitialiser le mot de passe</a>
            <p>Si vous ne vous êtes pas inscrit pour ce compte, veuillez ignorer cet e-mail.</p>
            <p>Bonnes salutations,<br>National Statistics Institute</p>
          </div>
        </body>
      </html>
    `;
    await sendMail(user_s.email, subject, htmlContent);

    res
      .status(200)
      .send({ message: "Email de réinitialisation du mot de passe envoyé." });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erreur dans le traitement de la demande." });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user_s = await user.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });
    if (!user_s) {
      return res.status(400).send({ message: "Token invalide ou expiré." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user_s.password = hashedPassword;
    user_s.resetToken = null;
    user_s.resetTokenExpiry = null;
    await user_s.save();
    res
      .status(200)
      .send({ message: "Réinitialisation du mot de passe réussie." });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erreur de réinitialisation du mot de passe." });
  }
};
exports.updateUserPassword = async (req, res) => {
  try {
    const id = req.params.id;

    const { PreviousPassword, NewPassword } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const users = await db.user.findByPk(id);

    if (!users) {
      return res.status(404).json({ message: "User not found." });
    }
    const passwordIsValid = bcrypt.compareSync(
      PreviousPassword,
      users.password
    );

    if (!passwordIsValid) {
      return res.status(400).json({ message: "Invalid previous password." });
    }

    if (passwordIsValid) {
      const hashedPassword = await bcrypt.hash(NewPassword, 10);
      users.password = hashedPassword;
      await users.save();
      return res
        .status(200)
        .json({ message: "Mot de passe modifié avec succès" });
    }
  } catch (error) {
    console.error("Error updating password!", error);
    return res.status(500).json({ message: "Server error." });
  }
};



storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: "1000000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).single("photo_profil");

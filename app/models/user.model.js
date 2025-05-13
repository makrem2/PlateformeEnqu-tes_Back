const { v4: uuidv4 } = require("uuid");
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    username: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING},
    password: {type: DataTypes.STRING},
    telephone: { type: DataTypes.STRING, allowNull: false },
    adresse: { type: DataTypes.STRING },
    photo_profil: { type: DataTypes.STRING },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING, allowNull: true },
    verificationCode: { type: DataTypes.STRING, allowNull: true },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiry: { type: DataTypes.DATE, allowNull: true },
  });

  return User;
};

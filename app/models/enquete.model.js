const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Enquete = sequelize.define("enquete", {
    enquete_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    titre: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    type: {
      type: DataTypes.ENUM("MENSUELLE", "TRIMESTRIELLE", "SEMESTRIELLE"),
      allowNull: false,
    },
    dateDebut: { type: DataTypes.DATE, allowNull: false },
    dateFin: { type: DataTypes.DATE, allowNull: false },
    statut: {
      type: DataTypes.ENUM("EN_ATTENTE", "EN_COURS", "CLOTUREE"),
      defaultValue: "EN_ATTENTE",
    },
  });

  return Enquete;
};

const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Reponse = sequelize.define("Reponse", {
    reponse_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },

    // Identifiants de liaison
    enqueteId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    entrepriseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // === Champs du questionnaire ===
    raisonSociale: DataTypes.STRING,
    adresse: DataTypes.STRING,
    telephone: DataTypes.STRING,
    nomResponsable: DataTypes.STRING,
    fonctionResponsable: DataTypes.STRING,
    emailResponsable: DataTypes.STRING,
    brancheActivite: DataTypes.STRING,
    estExportatrice: DataTypes.BOOLEAN,
    productionVarieSelonSaison: DataTypes.BOOLEAN,

    situationTrimestreActuel: DataTypes.ENUM("bonne", "moyenne", "mediocre"),
    situationTrimestrePrecedent: DataTypes.ENUM("bonne", "moyenne", "mediocre"),
    previsionTroisMois: DataTypes.ENUM("sameliorer", "rester", "deteriorer"),

    mainOeuvre: DataTypes.ENUM("augmentation", "stabilite", "diminution"),
    prixMatieres: DataTypes.ENUM("hausse", "stabilite", "baisse"),
    pleineCapacite: DataTypes.BOOLEAN,
    tauxUtilisationCapacite: DataTypes.FLOAT,
    aDesDifficultes: DataTypes.BOOLEAN,
    difficultes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    dateReponse: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return Reponse;
};

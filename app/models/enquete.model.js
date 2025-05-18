const { v4: uuidv4 } = require("uuid");
module.exports = (sequelize, DataTypes) => {
  const Enquete = sequelize.define("Enquete", {
    enquete_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    annee: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM("mensuelle", "trimestrielle", "semestrielle"),
      allowNull: false,
    },
    trimestre: { type: DataTypes.ENUM("1", "2", "3", "4"), allowNull: true },
    deadline: { type: DataTypes.DATE, allowNull: false },

    // Champs formulaire
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
      type: DataTypes.JSON, // tableau: ["tresorerie", "main d’oeuvre", "transport"]
      defaultValue: [],
    },

    statut: {
      type: DataTypes.ENUM("en_attente", "repondue", "terminee", "expiree"),
      defaultValue: "en_attente",
    },
  });

  return Enquete;
};

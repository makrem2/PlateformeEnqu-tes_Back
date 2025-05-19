module.exports = (sequelize, DataTypes) => {
  const Reponse = sequelize.define("reponse", {
    reponse_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    valeur: { type: DataTypes.TEXT, allowNull: true },
    dateSoumission: { type: DataTypes.DATE, allowNull: true },
    statut: {
      type: DataTypes.ENUM("ENVOYEE", "NON_ENVOYEE", "EN_ATTENTE"),
      defaultValue: "EN_ATTENTE",
    },
  });

  return Reponse;
};

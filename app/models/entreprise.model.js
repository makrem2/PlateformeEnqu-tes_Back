module.exports = (sequelize, DataTypes) => {
  const Entreprise = sequelize.define("entreprises", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secteur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pays: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Entreprise;
};

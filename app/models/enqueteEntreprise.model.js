module.exports = (sequelize, DataTypes) => {
  const EnqueteEntreprise = sequelize.define("EnqueteEntreprise", {
    emailEnvoye: { type: DataTypes.BOOLEAN, defaultValue: false },
    rappelEnvoye: { type: DataTypes.BOOLEAN, defaultValue: false },
    reponseSoumise: { type: DataTypes.BOOLEAN, defaultValue: false }
  });

  return EnqueteEntreprise;
};

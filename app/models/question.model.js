module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define("question", {
    question_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    texte: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM("CHOIX", "TEXTE", "OUI_NON"),
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON, // tableau de choix possibles
      allowNull: true,
    },
  });

  return Question;
};

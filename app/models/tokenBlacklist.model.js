module.exports = (sequelize, DataTypes) => {
  const TokenBlackList = sequelize.define("tokenBlackLists", {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return TokenBlackList;
};

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define("roles", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING
    }
  });

  return Role;
};

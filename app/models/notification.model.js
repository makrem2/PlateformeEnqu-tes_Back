module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("notification", {
    notification_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("INVITATION", "RAPPEL", "CLOTURE"),
      allowNull: false,
    },
    dateEnvoi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    statut: {
      type: DataTypes.ENUM("ENVOYEE", "NON_ENVOYEE"),
      defaultValue: "NON_ENVOYEE",
    },
  });

  return Notification;
};

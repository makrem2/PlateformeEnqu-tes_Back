const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model")(sequelize, Sequelize);
db.role = require("../models/role.model")(sequelize, Sequelize);
db.entreprise = require("../models/entreprise.model")(sequelize, Sequelize);

db.tokenBlacklist = require("../models/tokenBlacklist.model")(
  sequelize,
  Sequelize
);

db.enquete = require("../models/enquete.model")(sequelize, Sequelize);
db.question = require("../models/question.model")(sequelize, Sequelize);
db.reponse = require("../models/reponse.model")(sequelize, Sequelize);
db.notification = require("../models/notification.model")(sequelize, Sequelize);

db.role.belongsToMany(db.user, { through: "user_roles", foreignKey: "roleId" });
db.user.belongsToMany(db.role, { through: "user_roles", foreignKey: "userId" });

db.user.hasOne(db.entreprise, { foreignKey: "user_id", onDelete: "CASCADE" });
db.entreprise.belongsTo(db.user, { foreignKey: "user_id" });

// Enquete - Entreprise (many-to-many)
db.enquete_entreprise = sequelize.define("enquete_entreprise", {});
db.enquete.belongsToMany(db.entreprise, {
  through: db.enquete_entreprise,
  foreignKey: "enquete_id",
});
db.entreprise.belongsToMany(db.enquete, {
  through: db.enquete_entreprise,
  foreignKey: "entreprise_id",
});

// Enquete - Question (one-to-many)
db.enquete.hasMany(db.question, { foreignKey: "enquete_id" });
db.question.belongsTo(db.enquete, { foreignKey: "enquete_id" });

// Question - Reponse (one-to-many)
db.question.hasMany(db.reponse, { foreignKey: "question_id" });
db.reponse.belongsTo(db.question, { foreignKey: "question_id" });

// Entreprise - Reponse
db.entreprise.hasMany(db.reponse, { foreignKey: "entreprise_id" });
db.reponse.belongsTo(db.entreprise, { foreignKey: "entreprise_id" });

// Enquete - Reponse
db.enquete.hasMany(db.reponse, { foreignKey: "enquete_id" });
db.reponse.belongsTo(db.enquete, { foreignKey: "enquete_id" });

// Notification - Entreprise
db.entreprise.hasMany(db.notification, { foreignKey: "entreprise_id" });
db.notification.belongsTo(db.entreprise, { foreignKey: "entreprise_id" });

// Notification - Enquete
db.enquete.hasMany(db.notification, { foreignKey: "enquete_id" });
db.notification.belongsTo(db.enquete, { foreignKey: "enquete_id" });

db.ROLES = ["admin", "entreprise"];

module.exports = db;

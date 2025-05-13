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

db.role.belongsToMany(db.user, { through: "user_roles", foreignKey: "roleId" });
db.user.belongsToMany(db.role, { through: "user_roles", foreignKey: "userId" });

db.user.hasOne(db.entreprise, { foreignKey: "user_id", onDelete: "CASCADE" });
db.entreprise.belongsTo(db.user, { foreignKey: "user_id" });

db.ROLES = ["admin", "entreprise"];

module.exports = db;

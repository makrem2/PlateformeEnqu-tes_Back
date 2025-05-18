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

db.enquete = require("../models/enquete.model")(sequelize, Sequelize);
db.reponse = require("../models/reponse.model")(sequelize, Sequelize);
db.enqueteEntreprise = require("../models/enqueteEntreprise.model")(sequelize, Sequelize);



db.tokenBlacklist = require("../models/tokenBlacklist.model")(
  sequelize,
  Sequelize
);

db.role.belongsToMany(db.user, { through: "user_roles", foreignKey: "roleId" });
db.user.belongsToMany(db.role, { through: "user_roles", foreignKey: "userId" });

db.user.hasOne(db.entreprise, { foreignKey: "user_id", onDelete: "CASCADE" });
db.entreprise.belongsTo(db.user, { foreignKey: "user_id" });


// ---- One user = one entreprise (if role = entreprise)
db.user.hasOne(db.entreprise, { foreignKey: "user_id", onDelete: "CASCADE" });
db.entreprise.belongsTo(db.user, { foreignKey: "user_id" });

// ---- Many enquêtes to many entreprises (with pivot table)
db.enquete.belongsToMany(db.entreprise, { through: db.enqueteEntreprise });
db.entreprise.belongsToMany(db.enquete, { through: db.enqueteEntreprise });

// ---- Each entreprise may respond to an enquête
db.reponse.belongsTo(db.entreprise, { foreignKey: "entrepriseId" });
db.reponse.belongsTo(db.enquete, { foreignKey: "enqueteId" });
db.entreprise.hasMany(db.reponse, { foreignKey: "entrepriseId" });
db.enquete.hasMany(db.reponse, { foreignKey: "enqueteId" });

db.ROLES = ["admin", "entreprise"];


module.exports = db;

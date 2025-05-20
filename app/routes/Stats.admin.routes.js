const { authJwt } = require("../middleware");
const StatsController = require("../controllers/Stats.admin.controller");
const express = require("express");

const router = express.Router();

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.get('/stats', StatsController.getAdminStats);


  router.get('/getTauxReponseParEntreprise',StatsController.getTauxReponseParEntreprise);
  router.get('/getTotalEnquetesParEntreprise',StatsController.getTotalEnquetesParEntreprise);


  app.use("/api/Statsadmin", router);
};

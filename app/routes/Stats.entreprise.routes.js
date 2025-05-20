const { authJwt } = require("../middleware");
const StatsController = require("../controllers/Stats.entreprise.controller");
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


router.get('/stats/:entrepriseId', StatsController.getEntrepriseStats);


router.get('/getReponsesMensuelles/:entrepriseId', StatsController.getReponsesMensuelles);
router.get('/getReponsesParType/:entrepriseId', StatsController.getReponsesParType);


  app.use("/api/Statsentreprise", router);
};

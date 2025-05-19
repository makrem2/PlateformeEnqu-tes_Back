const { authJwt } = require("../middleware");
const controller = require("../controllers/entreprise.controller");
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


  router.put('/updateentreprise/:id',controller.UpdateEntreprise);
  router.get('/getOneEntreprise/:id',controller.getOneEntreprise);

  router.get('/GetAllEntreprise',controller.GetAllEntreprise);

  app.use("/api/entreprise", router);

  };
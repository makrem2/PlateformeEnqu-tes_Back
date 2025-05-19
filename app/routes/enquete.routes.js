const { authJwt } = require("../middleware");
const enqueteController = require("../controllers/enquete.controller");
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

  // CRUD enquêtes
  router.post("/createEnquete", enqueteController.createEnquete);
  router.get("/getAllEnquetes", enqueteController.getAllEnquetes);
  router.get("/getEnqueteById/:id", enqueteController.getEnqueteById);
  router.put("/updateEnquete/:id", enqueteController.updateEnquete);

  router.delete("/deleteEnquete/:id",enqueteController.deleteEnquete);


  router.patch('/changestatusToEN_COURS/:id',enqueteController.changestatusToEN_COURS)

  // Assigner une enquête à des entreprises
  router.post("/assignEnqueteToEntreprises/:id", enqueteController.assignEnqueteToEntreprises);

  app.use("/api/enquete", router);
};

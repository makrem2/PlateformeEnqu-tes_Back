const { authJwt } = require("../middleware");
const controller = require("../controllers/enquete.controller");
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

  router.post("/createEnquete", controller.createEnquete);
  router.get("/getAllEnquetes", controller.getAllEnquetes);
  router.get("/getEnqueteById/:id", controller.getEnqueteById);

  app.use("/api/enquete", router);
};

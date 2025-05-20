const { authJwt } = require("../middleware");
const reponseController = require("../controllers/reponseController");
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

  // Créer des réponses (soumission d’un formulaire)
  router.post("/createReponses", reponseController.createReponses);

  // Obtenir toutes les réponses d’une entreprise pour une enquête
  router.get(
    "/getReponsesByEnqueteAndEntreprise/:enquete_id/:entreprise_id",
    reponseController.getReponsesByEnqueteAndEntreprise
  );

  // Mettre à jour une réponse
  router.put("/updateReponse/:id", reponseController.updateReponse);

  // Supprimer une réponse
  router.delete("/deleteReponse/:id", reponseController.deleteReponse);


  // router.get('/repondues/:entrepriseId', reponseController.getEnquetesRepondues);

  router.get('/derniere-repondue/:entrepriseId', reponseController.getDerniereEnqueteRepondue);

  router.get('/repondues/:entrepriseId', reponseController.getAllEnquetesRepondues);


  app.use("/api/reponses", router);
};

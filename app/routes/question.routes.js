const { authJwt } = require("../middleware");
const questionController = require("../controllers/questionController");
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

  router.post("/createQuestion", questionController.createQuestion);
  router.get("/getAllQuestions", questionController.getAllQuestions);
  router.get("/getQuestionById/:id", questionController.getQuestionById);
  router.put("/updateQuestion/:id", questionController.updateQuestion);
  router.delete("/deleteQuestion/:id", questionController.deleteQuestion);


  router.get('/getQuestionByEnquete_id/:id',questionController.getQuestionByEnquete_id);
  app.use("/api/questions", router);
};

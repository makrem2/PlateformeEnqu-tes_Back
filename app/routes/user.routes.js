const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
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

  router.put(
    "/updateUser/:id",
    [authJwt.verifyToken],
    controller.upload,
    controller.updateUser
  );

  router.delete(
    "/deleteUser/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteUser
  );

  router.get("/getOneUser/:id", [authJwt.verifyToken], controller.getOneUser);

  router.get(
    "/getAllUsers",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsers
  );

  router.patch(
    "/status/toggleUserStatus/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.toggleUserStatus
  );

  router.post("/request-password-reset", controller.requestPasswordReset);

  router.post("/reset-password", controller.resetPassword);

  router.put("/updateUser/:id", controller.updateUser);

  router.patch(
    "/updateUserPassword/:id",
    [authJwt.verifyToken],
    controller.updateUserPassword
  );

  app.use("/api/user", router);
};

const { Router } = require("express");
const AuthController = require("../controller/AuthController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const AuthRouter = new Router()

AuthRouter.post('/login', AuthMiddleware.loginMiddleware(), AuthController.login)
AuthRouter.post('/refreshToken', AuthController.refreshToken)

module.exports = AuthRouter
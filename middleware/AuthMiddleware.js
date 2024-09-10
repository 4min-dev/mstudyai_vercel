const { check } = require("express-validator");

class AuthMiddleware {
    loginMiddleware() {
        return [
            check('email','Неверная почта').isEmail(),
            check('password','Пароль не может быть пустым').notEmpty()
        ]
    }
}

module.exports = new AuthMiddleware()
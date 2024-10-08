const jwt = require('jsonwebtoken')
const Users = require("../models/Users")
const { validationResult } = require('express-validator')

const SECRET_KEY = process.env.JWT_ACCESS
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH

class AuthController {
    async login(req, res) {
        try {
            const validationFields = validationResult(req)

            if (!validationFields.isEmpty()) {
                return res.status(400).json({ message: validationFields.errors[0].msg })
            }

            const { email, password } = req.body;

            const user = await Users.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: "Пользователь не найден" });
            }

            if (user.password !== password) {
                return res.status(400).json({ message: "Неверный пароль" });
            }

            const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                secure: true,
                sameSite: 'None'
            });

            return res
                .status(200)
                .json({ message: "Login successful" })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: error })
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({ message: "Not authorizated" });
            }

            jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.status(403).json({ message: err });
                }

                const accessToken = jwt.sign({ userId: decoded.userId }, SECRET_KEY, { expiresIn: '15m' });

                res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
                return res.status(200).json({ accessToken });
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: error })
        }
    }

    logout(req, res) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: "Logged out successfully" });
    }
}

module.exports = new AuthController()
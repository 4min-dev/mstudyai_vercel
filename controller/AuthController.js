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

            const accessToken = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });


            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
            });; // 15 минут
            res.cookie('refreshToken', refreshToken, { 
                httpOnly: true, 
                maxAge: 7 * 24 * 60 * 60 * 1000,
            }); // 7 дней

            return res
                .status(200)
                .json({ message: "Login successful" })

        } catch (error) {
            console.log(error);
            throw new error(error)
        }
    }

    async verifyUser(req, res) {
        try {
            const { accessToken } = req.cookies;

            if (!accessToken) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            jwt.verify(accessToken, process.env.JWT_ACCESS, (err,decoded) => {
                if(err) {
                    return res.status(403).json({message:err})
                }

                return res.status(200).json({ authorizated:true, data:decoded });
            })
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({ message: "No refresh token found" });
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
            throw new error(error)
        }
    }

    logout(req, res) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: "Logged out successfully" });
    }
}

module.exports = new AuthController()
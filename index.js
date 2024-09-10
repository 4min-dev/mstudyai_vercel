require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const AuthRouter = require('./router/AuthRouter')

const app = express()

const PORT = process.env.PORT || 3000
const UI = process.env.UI

const corsOptions = {
    origin: 'https://mstudyai.com', // Замените на ваш реальный URL фронтенда
    credentials: true // Это позволяет передавать и получать куки
};

app.use(cors(corsOptions));
app.use(cookieParser(process.env.SECRET_COOKIE))
app.use(express.json())

app.use('/auth', AuthRouter)

const run = async () => {
    try {
        await mongoose.connect(UI)
        app.listen(PORT, () => console.log(`Server was launched - mstudyaivercel-production.up.railway.app`))
    } catch (error) {
        console.log(error)
        throw error
    }
}

run()
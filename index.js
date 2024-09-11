require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const AuthRouter = require('./router/AuthRouter')

const app = express()

const HOSTNAME = process.env.HOSTNAME || 'localhost'
const PORT = process.env.PORT || 3000
const UI = process.env.UI

app.use(cors({
    credentials: true
}));
app.use(cookieParser(process.env.SECRET_COOKIE))
app.use(express.json())

app.use('/auth', AuthRouter)

const run = async () => {
    try {
        await mongoose.connect(UI)
        app.listen(PORT, () => console.log(`Server was launched - http://${HOSTNAME}:${PORT}`))
    } catch (error) {
        console.log(error)
        throw error
    }
}

run()
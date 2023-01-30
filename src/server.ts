import dotenv from 'dotenv'
import express, { urlencoded } from 'express'
import { mongoConnect } from './database/mongo'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import path from 'path'
import { Request, Response } from 'express'
import router from './routes/routes'

dotenv.config()

mongoConnect()


const server = express()

server.use(cors())
server.use(express.json())
server.use(urlencoded({extended: true}))
server.use(fileUpload())
server.use(express.static(path.join(__dirname, '../public')))

server.use(router)

server.listen(process.env.PORT, () => {
    console.log('server running at localhost:5000')
})


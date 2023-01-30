
import { Request, Response } from "express"
import { validationResult, matchedData } from "express-validator"
import User from "../models/user"
import State from '../models/state'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'


const AuthController = {

    
    signin: async (req: Request, res: Response) => {
    
    },
    signup: async (req: Request, res: Response) => {

        const errors = validationResult(req)
        if(!errors.isEmpty()) {

            res.status(400)
            res.json({error: errors.mapped()})
            return
        }
        const data = matchedData(req)

    ////email check/////////////////////
        const useremail = await User.findOne({
            email: data.email
        })

        if(useremail) {
            res.status(400)
            res.json({error: {email: {msg: 'Email already exists'}}})
            return
        }

    ////state check //////////////////
        if(mongoose.Types.ObjectId.isValid(data.state)){

            const stateItem = await State.findById(data.state)
            if(!stateItem) {
                res.status(400)
                res.json({error: {state: {msg: 'State doesnt exist'}}})
                return
            }           

        } else {
            res.status(400)
            res.json({error: {state: {msg: 'State code error'}}})
            return

        }

    ////add//////////////////////////////////////////////////
                
        const passwordHash = await bcrypt.hash(data.password, 10)
        const payload = (Date.now() + Math.random()).toString()
        const token = await bcrypt.hash(payload as string, 10)
        
        const newUser = new User({
            name: data.name,
            email: data.email,
            state: data.state,
            passwordHash: passwordHash,
            token: token
        
        })      

        await newUser.save()
        res.status(200)
        res.json({signup: 'ok', token: token})

    },
    
}

export default AuthController
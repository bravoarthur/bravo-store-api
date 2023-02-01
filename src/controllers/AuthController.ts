
import { Request, Response } from "express"
import { validationResult, matchedData } from "express-validator"
import User from "../models/user"
import State from '../models/state'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import generateToken from "../helpers/generateToken"


const AuthController = {

    
    signin: async (req: Request, res: Response) => {

        const errors = validationResult(req)
        if(!errors.isEmpty()) {

            res.status(400)
            res.json({error: errors.mapped()})
            return
        }

        const data = matchedData(req)

        const user = await User.findOne({
            email: data.email
        })
        ////Email check/////////////////////////////
        if(!user) {
            res.status(400)
            res.json({error: {email: {msg: 'Email or password invalid'}}})
            return
        }
        /////password check ///////////////////////
        
        const match = await bcrypt.compare(data.password, user.passwordHash)
        if(!match) {
            res.status(400)
            res.json({error: {password: {msg: 'Email or password invalid'}}})
            return
        }

        
        const token = generateToken({id: user._id})        
        user.token = token
        await user.save()

        res.status(200)
        res.json({signup: 'ok', token: token, email: user.email})
    
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
        //const payload = (Date.now() + Math.random()).toString()
        //const token = await bcrypt.hash(payload as string, 10)
        let token = ''
        
        const newUser = new User({
            name: data.name,
            email: data.email,
            state: data.state,
            passwordHash: passwordHash,
            token: token        
        })  

        token = generateToken({id: newUser._id})
        newUser.token = token               
        
        await newUser.save()
        res.status(201)
        res.json({signup: 'ok', token: token})

    },
    
}

export default AuthController


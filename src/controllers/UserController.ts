import { Request, Response } from "express"
import State from '../models/state'
import User, { UserType } from "../models/user"
import Categories from "../models/categories"
import Ads, { AdsType } from '../models/ads'
import { validationResult, matchedData } from "express-validator"
import mongoose from "mongoose"
import bcrypt from 'bcrypt'

type UpdatesType = {
    name?: string,
    email?: string,
    state?: string,
    passwordHash?: string,
    token?: string
}

interface UserWithId extends UserType {
    _id: string
}


const UserController = {

    getStates: async (req: Request, res: Response) => {
        
        let states = await State.find()
        res.json({states})

    },
    
    info: async (req: Request, res: Response) => {        
        
        const user = req.user as UserWithId //injected by JWT in Auth.private
        
        if(!user) {
            res.json({error: 'Server error, login again'})
            return
        }

        const state = await State.findById(user.state)
        const ads = await Ads.find({idUser: user._id.toString()})
        
        let adList: AdsType[]  = []
       
        for(let i in ads) {

            const cat = await Categories.findById(ads[i].category)

            adList.push({
                idUser: ads[i]._id.toString(),
                status: ads[i].status,
                images: ads[i].images,
                dateCreated: ads[i].dateCreated,
                title: ads[i].title,
                category: cat?.slug ? cat.slug : 'invalid slug',
                price: ads[i].price,
                priceNegotiable: ads[i].priceNegotiable,
                description: ads[i].description,
                views: ads[i].views,
                state:  state?.name ? state.name : 'State invalid'
            })
            //adlist.push({...ads[i], category: cat.slug})
        }         

        res.json({
            name: user.name,
            email: user.email,
            state: state?.name,
            ads: adList
        })

    },



    editAction: async (req: Request, res: Response) => {

        const errors = validationResult(req)
        if(!errors.isEmpty()) {

            res.status(400)
            res.json({error: errors.mapped()})
            return
        }

        const data = matchedData(req)
            
        const updates: UpdatesType = {}

        if(data.name) {
            updates.name = data.name
        }

        if(data.email) {
            const emailCheck = await User.findOne({email: data.email})
            if(emailCheck) {
                res.status(401)
                res.json({error: {email: {msg: 'Email already exists'}}})
                return
            }
            updates.email = data.email
        }
        
        if(data.state) {            
            if(mongoose.Types.ObjectId.isValid(data.state)) {
                const stateCheck = await State.findById(data.state)
                if(!stateCheck) {
                    res.status(401)
                    res.json({error: {state: {msg: 'state doesnt exist'}}})
                    return
                }
                updates.state = data.state
            } else {
                res.status(401)
                res.json({error: {state: {msg: 'state doesnt exist'}}})
                return
            }
        }

        if(data.password) {
            updates.passwordHash = await bcrypt.hash(data.password,10)
            
        }        
        //refreshing user
        await User.findOneAndUpdate({token: data.token}, {$set: updates})
        res.json({update: 'user info changed successfuly'})        

    },

}

export default UserController
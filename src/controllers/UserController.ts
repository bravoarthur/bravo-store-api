import { Request, Response } from "express"
import { connection } from "mongoose"
import State from '../models/state'


const UserController = {

    getStates: async (req: Request, res: Response) => {
        
        let states = await State.find()
        res.json({states})

    },
    
    info: async (req: Request, res: Response) => {

    },
    editAction: async (req: Request, res: Response) => {

    },


}

export default UserController
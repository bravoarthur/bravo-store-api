import { Request, Response, NextFunction } from "express"
import { connection } from "mongoose"
import User from "../models/user"

const Auth = {
    private: async (req: Request, res: Response, next: NextFunction) => {

        if(!req.query.token && !req.body.token) {
            res.status(403) // not authorized
            res.json({notAllowed: true, token: 'Invalid Token, Please login again'})
            return
        }

        let token: string = ''
        if(req.query.token) {
            console.log('query')
            token = req.query.token as string
        }
        if(req.body.token) {
            console.log('body')
            token = req.body.token as string
        }
        
        
        if(token === '') {
            res.status(403) // not authorized
            res.json({notAllowed: true, token: 'Invalid Token, Please login again'})
            return
        }

        
        const user = await User.findOne({
            token: token
        })
        
        //console.log(user)
        if(!user) {
            res.status(403) // not authorized
            res.json({notAllowed: true, token: 'Invalid Token, Please login again'})
            return
        }
        next()

    }

}

export default Auth

import { Request, Response } from "express"
import Categories, { CategoryType } from "../models/categories"
import dotenv from 'dotenv'
import User from "../models/user"
import Ads from "../models/ads"
import {v4 as uuid} from 'uuid'
import Jimp from 'jimp'
import {  UploadedFile } from "express-fileupload"


dotenv.config()

const addImage = async (buffer: any) => {
    let newName = `${uuid()}.jpg`
    let tmpImg = await Jimp.read(buffer)
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`)
    return newName
}


const AdsController = {
    
    getCategories: async (req: Request, res: Response) => {

        const cats = await Categories.find()
        
        let categories = cats.map((item, index) => {

            const updatedCat = {
                _id: item._id,
                name: item.name,
                slug: item.slug,
                img: `${process.env.BASE}/assets/images/${cats[index].slug}.png`
            }                       
            return updatedCat            
        })        
        /*
        for(let i in cats) {
            console.log(cats[i])
            categories.push({
                ...cats[i], img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            })
        }*/        
        res.json({categories: categories})    
    },
    
    addAction: async (req: Request, res: Response) => {

        let {title, price, priceNeg, desc, cat, token} = req.body

        const user = await User.findOne({token}).exec()

        if(!user) {
            res.json({err: {messaga: 'The user needs to be logged to add ads'}})
            return
        }

        if(!title || !cat) {
            res.json({error: {message: 'Title or Category is missing'}})
            return
        }

        if(price) {
            price = price.replace('.', '').replace(',', '.')
            price = parseFloat(price)
        } else {
            price = 0
        }

        const newAd = new Ads()
        newAd.status = true,
        newAd.idUser = user._id,
        newAd.state = user.state,
        newAd.dateCreated = new Date(),
        newAd.title = title,
        newAd.category = cat,
        newAd.price = price,
        newAd.priceNegotiable = priceNeg==='true' ? true : false,
        newAd.description = desc,
        newAd.views = 0

        if(req.files && req.files.img) {
            
            let imgFiles = req.files.img as UploadedFile[] 

            if(imgFiles.length === undefined) {
                let imgFile = req.files.img as UploadedFile
                
                if(['image/jpeg', 'image/jpg', 'image/png'].includes(imgFile.mimetype)) {
                    let url = await addImage(imgFile.data)   
                    newAd.images.push({
                        url: url,
                        default: false
                    })     
                } else {
                    res.status(400)
                    res.json({error: {message: 'invalid image format'}})
                    return
                }

            } else {

                for(let i=0; i < imgFiles.length; i++) {

                    if(['image/jpeg', 'image/jpg', 'image/png'].includes(imgFiles[i].mimetype)) {

                        let url = await addImage(imgFiles[i].data)   
                        newAd.images.push({
                            url: url,
                            default: false
                        })    
                    } else {
                        res.status(400)
                        res.json({error: {message: 'invalid image format'}})
                        return
                    }
                }                           
            }           
        }
    
        if(newAd.images.length > 0) {
            newAd.images[0].default= true
        }  
        
        const info = await newAd.save()
        res.json({id: info._id})
    
    },

    getList: async (req: Request, res: Response) => {
    
    },

    getItem: async (req: Request, res: Response) => {
    
    },
    editAction: async (req: Request, res: Response) => {
    
    },

}

export default AdsController
import { Schema, model, Model, connection } from "mongoose";

export type AdsType = {
    
    idUser: string,
    state: string,
    category: string,
    images: [object],
    dateCreated: string,
    title: string,
    price: number,
    priceNegotiable: boolean,
    description: string,
    views: number,
    status: string,

} 


const schema = new Schema<AdsType>({
    
    idUser: String,
    state: String,
    category: String,
    images: [Object],
    dateCreated: Date,
    title: String,
    price: Number,
    priceNegotiable: Boolean,
    description: String,
    views: Number,
    status: String,

    
})

const modelName: string = 'Ads'

console.log(connection.models[modelName])


export default (connection && connection.models[modelName]) ? connection.models[modelName] as Model<AdsType> : model<AdsType>(modelName, schema)



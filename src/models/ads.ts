import { Schema, model, Model, connection, Types } from "mongoose";

export type AdsType = {
    
    idUser: Types.ObjectId | string,
    state: string,
    category: string,
    images: [{url: string, default: boolean}],
    dateCreated: Date,
    title: string,
    price: number,
    priceNegotiable: boolean,
    description: string,
    views: number,
    status: boolean,

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
    status: Boolean,

    
})

const modelName: string = 'Ads'

console.log(connection.models[modelName])


export default (connection && connection.models[modelName]) ? connection.models[modelName] as Model<AdsType> : model<AdsType>(modelName, schema)



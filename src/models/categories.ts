import { Schema, model, Model, connection } from "mongoose";

export type CategoryType = {
    
    name: string,    
    slug: string,
    img?: string
    
} 


const schema = new Schema<CategoryType>({
    name: String,    
    slug: String
    
})

const modelName: string = 'Category'

console.log(connection.models[modelName])


export default (connection && connection.models[modelName]) ? connection.models[modelName] as Model<CategoryType> : model<CategoryType>(modelName, schema)


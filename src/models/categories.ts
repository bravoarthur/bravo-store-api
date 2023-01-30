import { Schema, model, connection } from "mongoose";

export type CategoryType = {
    
    name: string,    
    slug: string

} 


const schema = new Schema<CategoryType>({
    name: String,    
    slug: String
    
})

const modelName: string = 'Category'

console.log(connection.models[modelName])


export default (connection && connection.models[modelName]) ? connection.models[modelName] : model<CategoryType>(modelName, schema)


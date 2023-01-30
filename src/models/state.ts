import { Schema, model, connection } from "mongoose";

export type StateType = {
    name: string,
} 


const schema = new Schema<StateType>({
    name: String,    
})

const modelName: string = 'State'

console.log(connection.models[modelName])


export default (connection && connection.models[modelName]) ? connection.models[modelName] : model<StateType>(modelName, schema)


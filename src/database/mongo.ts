import dotenv from "dotenv";

dotenv.config();

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
//const MongoClient = require('mongodb').MongoClient

export const mongoConnect = async () => {
    try {
        console.log("connecting DB...");
        await mongoose.connect(process.env.MONGO_URL as string, {
            useNewUrlParser: true,
            //useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log("connectado");
    } catch (error) {
        console.log("DB NOT CONNECTED", error);
    }
};

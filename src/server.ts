import dotenv from "dotenv";
import express, {
    urlencoded,
    ErrorRequestHandler,
    NextFunction
} from "express";
import { mongoConnect } from "./database/mongo";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import { Request, Response } from "express";
import router from "./routes/routes";
import passport from "passport";

dotenv.config();

mongoConnect();

const server = express();

server.use(cors());
server.use(express.json());
server.use(urlencoded({ extended: true }));
server.use(fileUpload());
server.use(express.static(path.join(__dirname, "../public")));
server.use(passport.initialize());
require("./config/passport");
server.use(router);

server.use((req: Request, res: Response) => {
    res.status(404);
    res.json({ error: "PAGE NOT FOUND" });
});

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction
) => {
    if (err.status) {
        res.status(err.status);
        res.json({ error: err.message });
    } else {
        res.status(400); //bad request
        res.json({ error: "Server Error" });
    }
};
server.use(errorHandler);

server.listen(process.env.PORT, () => {
    console.log("server running at localhost:5000");
});

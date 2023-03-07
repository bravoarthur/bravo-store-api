import passport from "passport";
import dotenv from "dotenv";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user";

dotenv.config();

//--------------------Strategy CONFIG------------------------------------
const notAuthorizedJson = { status: 401, message: "Not Authorized" };

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY as string
};

passport.use(
    new JWTStrategy(options, async (payload, done) => {        
        const user = await User.findById(payload.id);

        if (user) {
            return done(null, user);
        } else {
            return done(notAuthorizedJson, false);
        }
    })
);

export default passport;

import jwt from "jsonwebtoken";

const generateToken = async (data: object) => {
    return jwt.sign(data, process.env.SECRET_KEY as string, {
        expiresIn: "2h"
    });
};

export default generateToken;

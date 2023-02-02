import jwt from "jsonwebtoken";

const generateToken = async (data: object) => {
    return jwt.sign(data, process.env.SECRET_KEY as string, {
        expiresIn: "15min"
    });
};

export default generateToken;

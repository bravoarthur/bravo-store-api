import jwt from 'jsonwebtoken'
const generateToken = (data:object) => {

    return jwt.sign(data, process.env.SECRET_KEY as string, {expiresIn: '3min'})

}

export default generateToken
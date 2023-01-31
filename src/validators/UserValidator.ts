import { checkSchema } from "express-validator"

const UserValidator = {

    editAction: checkSchema({
        token: {
            notEmpty: true

        },
        name: {
            optional: true, //optional because the user doesnt need to change all, but if is changing the rest of validations are made
            trim: true,
            //cut spaces from beggining and end of receiveid name
            //notEmpty: true,
            isLength: {options: {min: 2}},
            errorMessage: 'Name contains at least 2 characters'
        },
        email: {
            optional: true,
            trim: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'Invalid email'

        },
        password: {
            optional: true,
            //notEmpty: true,
            isLength: {
                options: {min: 6}
            },
            errorMessage: 'Password contains at least 6 characters'
        },
        state: {
            optional: true,
            trim: true,
            notEmpty: true,
            errorMessage: 'State doesnt exist'
        }
    }),

    
}

export default UserValidator


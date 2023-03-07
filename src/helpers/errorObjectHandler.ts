
const errorOjectHandler = (param: string, msg: string) => {

    const errorObject = { error: [{param: param, msg: msg}]}

    return errorObject
    
}

export default errorOjectHandler
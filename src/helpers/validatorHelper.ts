import { validationResult, matchedData } from "express-validator";
import { Request, Response } from "express";

const validateAndGetData = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let arrayErrors = errors.array()
        let errorsResponse = arrayErrors.map(item => {return {param: item.param, msg: item.msg} })
        res.status(400);
        res.json({ error: errorsResponse});
        return;
    } else {
        return matchedData(req);
    }
};

export default validateAndGetData;

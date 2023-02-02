import { validationResult, matchedData } from "express-validator";
import { Request, Response } from "express";

const validateAndGetData = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        res.json({ error: errors.mapped() });
        return;
    } else {
        return matchedData(req);
    }
};

export default validateAndGetData;

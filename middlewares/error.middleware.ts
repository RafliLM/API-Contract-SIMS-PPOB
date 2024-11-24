import type { Request, Response, NextFunction } from "express"
import { BadRequestError } from "../errors/BadRequestError"
import { AuthenticationError } from "../errors/AuthenticationError"
import { NotFoundError } from "../errors/NotFoundError"
import { TokenExpiredError } from "jsonwebtoken"

export default (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof BadRequestError) {
        return res.status(400).json({
            status: 102,
            message: err.message,
            data: null
        })
    }
        
    if (err instanceof AuthenticationError) {
        return res.status(401).json({
            status: 108,
            message: err.message,
            data: null
        })
    }

    if (err instanceof TokenExpiredError) {
        return res.status(401).json({
            status: 108,
            message: "Token tidak tidak valid atau kadaluwarsa",
            data: null
        })
    }

    if (err instanceof NotFoundError) {
        return res.status(404).json({
            status: 404,
            message: err.message,
            data: null
        })
    }
    console.log(err)
    return res.status(500).send("Internal Server Error")
}
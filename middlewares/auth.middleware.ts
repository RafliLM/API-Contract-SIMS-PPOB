import type { Request, Response, NextFunction } from "express"
import { BadRequestError } from "../errors/BadRequestError"
import { AuthenticationError } from "../errors/AuthenticationError"
import { verify, type JwtPayload } from "jsonwebtoken"

const secretKey = process.env.SECRET_KEY as string

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token)
            throw new AuthenticationError("Token tidak tidak valid atau kadaluwarsa")
        const user = verify(token, secretKey) as JwtPayload
        res.locals.userId = user.id
        next()
    } catch (error) {
        next(error)
    }
}
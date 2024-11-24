import { Router } from "express";
import { body, validationResult } from "express-validator";
import { BadRequestError } from "../errors/BadRequestError";
import authService from "../services/auth.service";

const authController = Router()

authController.post("/registration", 
    body('email').trim().notEmpty().withMessage("Parameter email harus diisi").isEmail().withMessage("Parameter email tidak sesuai format"),
    body('first_name').trim().notEmpty().withMessage("Parameter first_name harus diisi"),
    body('last_name').trim().notEmpty().withMessage("Parameter last_name harus diisi"),
    body('password').trim().notEmpty().withMessage("Parameter password harus diisi").isLength({ min: 8 }).withMessage("Password length minimal 8 karakter"),
    async (req, res, next) => {
        try {
            const validate = validationResult(req)
            if (!validate.isEmpty()) 
                throw new BadRequestError(validate.array()[0].msg)
            return res.json({
                status: 0,
                message: await authService.register(req.body),
                data: null
            })
        } catch (error) {
            next(error)
        }
    }
)

authController.post("/login",
    body('email').trim().notEmpty().withMessage("Parameter email harus diisi").isEmail().withMessage("Parameter email tidak sesuai format"),
    body('password').trim().notEmpty().withMessage("Parameter password harus diisi").isLength({ min: 8 }).withMessage("Password length minimal 8 karakter"), 
    async (req, res, next) => {
        try {
            const validate = validationResult(req)
            if (!validate.isEmpty()) 
                throw new BadRequestError(validate.array()[0].msg)
            return res.json({
                status: 0,
                message: "Login Sukses",
                data: {
                    token: await authService.login(req.body)
                }
            })
        } catch (error) {
            next(error)   
        }
    }
)

export default authController
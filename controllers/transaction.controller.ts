import { Router } from "express";
import transactionService from "../services/transaction.service";
import { body, query, validationResult } from "express-validator";
import { BadRequestError } from "../errors/BadRequestError";

const transactionController = Router()

transactionController.get("/balance", async (req, res, next) => {
    try {
        return res.json({
            status: 0,
            message: "Get Balance Berhasil",
            data: {
                balance: await transactionService.getBalance(res.locals.userId)
            } 
        })
    } catch (error) {
        next(error)
    }
})

transactionController.post("/topup",
    body('top_up_amount').notEmpty().isInt({ min: 0 }).withMessage("Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0"),
    async (req, res, next) => {
        try {
            const validate = validationResult(req)
            if (!validate.isEmpty()) 
                throw new BadRequestError(validate.array()[0].msg)
            return res.json({
                status: 0,
                message: "Top Up Balance berhasil",
                data: {
                    balance: await transactionService.topupBalance(res.locals.userId, req.body.top_up_amount)
                } 
            })
        } catch (error) {
            next(error)
        }
    }
)

transactionController.post("/transaction",
    body('service_code').trim().notEmpty().withMessage("Parameter service_code harus di isi"),
    async (req, res, next) => {
        try {
            const validate = validationResult(req)
            if (!validate.isEmpty()) 
                throw new BadRequestError(validate.array()[0].msg)
            return res.json({
                status: 0,
                message: "Transaksi berhasil",
                data: await transactionService.createTransaction(res.locals.userId, req.body.service_code)
            })
        } catch (error) {
            next(error)
        }
    }
)

transactionController.get("/transaction/history",
    query("limit").isInt({min: 0}).withMessage("Parameter limit hanya boleh angka dan tidak boleh lebih kecil dari 0").optional(),
    query("offset").isInt({min: 0}).withMessage("Parameter offset hanya boleh angka dan tidak boleh lebih kecil dari 0").optional(),
    async (req, res, next) => {
        try {
            const validate = validationResult(req)
            if (!validate.isEmpty()) 
                throw new BadRequestError(validate.array()[0].msg)
            let limit = (req.query as any).limit
            if (limit != undefined)
                limit = Number(limit)
            let offset = (req.query as any).offset
            if (offset == undefined)
                offset = 0
            else
                offset = Number(offset)
            return res.json({
                status: 0,
                message: "Get History Berhasil",
                data: await transactionService.getTransactionHistory(res.locals.userId, offset, limit)
            })
        } catch (error) {
            next(error)
        }        
    }
)

export default transactionController
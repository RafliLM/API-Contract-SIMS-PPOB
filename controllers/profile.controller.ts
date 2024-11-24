import { Router } from "express";
import profileService from "../services/profile.service";
import { body, validationResult } from "express-validator";
import { BadRequestError } from "../errors/BadRequestError";
import multer from "multer";

const profileController = Router()

profileController.get("/", async (req, res, next) => {
    try {
        return res.json({
            status: 0,
            message: "Sukses",
            data: await profileService.getProfile(res.locals.userId)
        })
    } catch (error) {
        next(error)
    }
})

profileController.put("/update", 
    body('first_name').trim().notEmpty().withMessage("Parameter first_name harus diisi"),
    body('last_name').trim().notEmpty().withMessage("Parameter last_name harus diisi"),
    async (req, res, next) => {
    try {
        const validate = validationResult(req)
        if (!validate.isEmpty()) 
            throw new BadRequestError(validate.array()[0].msg)
        return res.json({
            status: 0,
            message: "Update Pofile berhasil",
            data: await profileService.updateProfile(res.locals.userId, req.body)
        })
    } catch (error) {
        next(error)
    }
})

profileController.put("/image", 
    multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 1024 * 1024 }
    }).single('file'),
    async (req, res, next) => {
    try {
        const file = req.file
        if (!file)
            throw new BadRequestError("Field file tidak boleh kosong")
        if(file.mimetype != "image/png" && file.mimetype != "image/jpeg")
            throw new BadRequestError("Format Image tidak sesuai")
        return res.json({
            status: 0,
            message: "Update Profile Image berhasil",
            data: await profileService.updateProfileImage(res.locals.userId, file)
        })
    } catch (error) {
        next(error)
    }
})

export default profileController
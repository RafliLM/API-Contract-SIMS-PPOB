import { Router } from "express";
import informationService from "../services/information.service";

const informationController = Router()

informationController.get("/banner", async (req, res, next) => {
    try {
        return res.json({
            status: 0,
            message: "Sukses",
            data: await informationService.getBanners()
        })
    } catch (error) {
        next(error)
    }
})

informationController.get("/services", async (req, res, next) => {
    try {
        return res.json({
            status: 0,
            message: "Sukses",
            data: await informationService.getServices()
        })
    } catch (error) {
        next(error)
    }
})

export default informationController
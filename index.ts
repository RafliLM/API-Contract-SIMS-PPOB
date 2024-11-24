import express from "express"
import authController from "./controllers/auth.controller"
import errorMiddleware from "./middlewares/error.middleware"
import informationController from "./controllers/information.controller"
import authMiddleware from "./middlewares/auth.middleware"
import profileController from "./controllers/profile.controller"
import transactionController from "./controllers/transaction.controller"

const port = 8080

const app = express()

app.use(express.json())

app.use(authController)
app.use(informationController)
app.use("/profile", authMiddleware, profileController)
app.use(authMiddleware, transactionController)
app.use(errorMiddleware)

app.listen(port, () => {
    console.log(`App running on port ${8080}`)
})
import express from "express"
import { loginUser,registerUser } from "../controllers/userController.js"
//import { userOrders } from "../controllers/orderController.js"
//import authMiddleware from "../middleWare/auth.js"

const userRouter = express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)

export default userRouter;
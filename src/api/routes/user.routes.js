import express from "express";
import UserController from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();
userRouter.use("/user-profile/:id", UserController.getUserById);
userRouter.use("/user-profile/:id", UserController.updateUser);
userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.loginUser);
userRouter.post("/forgot-password", UserController.forgotPassword);
userRouter.post("/change-password", UserController.changePassword);
userRouter.post("/verify-otp", UserController.verifyOTP);
userRouter.post("/resend-otp", UserController.resendOTP);
userRouter.post("/chat-bot", UserController.chatWithAI);
userRouter.post("/send-email", UserController.sendEmail);
userRouter.post("/subscribe-news", UserController.subscribeEmail);

export default userRouter;

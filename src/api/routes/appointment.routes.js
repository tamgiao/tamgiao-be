import express from "express";
import AppointmentController from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/create_payment_url", AppointmentController.createPaymentURL);
appointmentRouter.get("/vnpay_ipn", AppointmentController.VNPayIPN);

export default appointmentRouter;

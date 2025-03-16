import express from "express";
import AppointmentController from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/create_payment_link", AppointmentController.createPaymentLink);
appointmentRouter.post("/check_payment_status", AppointmentController.checkPaymentStatus);
appointmentRouter.post("/update_appointment/:appointmentId", AppointmentController.updateAppointment);
appointmentRouter.post("/wait_for_payment", AppointmentController.waitForPayment);
appointmentRouter.post("/approve_appointment", AppointmentController.confirmPayment);
appointmentRouter.post("/cancel_appointment", AppointmentController.cancelPayment);
appointmentRouter.post("/appointments/:userId", AppointmentController.getAppointmentListByUserId);
appointmentRouter.post("/count-pending-appointment", AppointmentController.checkPendingAppointmentByUserId);

export default appointmentRouter;

import express from "express";
import AppointmentController from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/create_payment_link", AppointmentController.createPaymentLink);
appointmentRouter.post("/check_payment_status", AppointmentController.checkPaymentStatusAPI);
appointmentRouter.post("/update_appointment/:appointmentId", AppointmentController.updateAppointment);
appointmentRouter.post("/wait_for_payment", AppointmentController.waitForPayment);
appointmentRouter.post("/approve_appointment", AppointmentController.confirmPayment);
appointmentRouter.post("/cancel_appointment", AppointmentController.cancelPayment);
appointmentRouter.get("/appointment-list/:userId", AppointmentController.getAppointmentListByUserId);
appointmentRouter.post("/count-pending-appointment", AppointmentController.checkPendingAppointmentByUserId);
appointmentRouter.post("/create-meet-url", AppointmentController.createMeetUrlAPI);
appointmentRouter.post("/appointment-details", AppointmentController.getUserAppointmentById);
appointmentRouter.post("/create-zoom-meeting", AppointmentController.createZoomMeetingAPI);

export default appointmentRouter;

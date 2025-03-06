import express from "express";
import psychologistController from "../controllers/psychologist.controller.js";
import availabilityController from "../controllers/availability.controller.js";

const psychologistRouter = express.Router();

psychologistRouter.get("/get-psychologist-list", psychologistController.getPsychologistList);
psychologistRouter.get("/get-specialization-list", psychologistController.getUniqueSpecializations);
psychologistRouter.get("/:doctorId", psychologistController.getPsychologistById);
psychologistRouter.get("/scheduleList/:doctorId", availabilityController.getAvailabilitiesById);
psychologistRouter.get("/schedule/:scheduleId", availabilityController.getAvailabilityById);
psychologistRouter.post("/save-appointment", psychologistController.saveAppointment);
psychologistRouter.get("/appointment/:appointmentId", psychologistController.getAppointmentById);

export default psychologistRouter;

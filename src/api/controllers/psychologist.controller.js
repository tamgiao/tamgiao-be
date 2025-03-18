import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import Availability from "../models/availability.model.js";
import { createPaymentLink } from "../services/payOS.service.js";
import mongoose from "mongoose";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer().none();

export const getPsychologistList = async (req, res) => {
    try {
        // Find all users with role "psychologist"
        const psychologists = await User.find({ role: "psychologist" }).select("-password"); // Exclude password field for security

        res.status(200).json({
            success: true,
            count: psychologists.length,
            data: psychologists,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Controller to fetch unique specializations of psychologists
export const getUniqueSpecializations = async (req, res) => {
    try {
        // Fetch all specializations of psychologists
        const psychologists = await User.find(
            { role: "psychologist" },
            { "psychologist.psychologistProfile.specialization": 1, _id: 0 }
        );

        // Extract specializations and get unique ones
        const specializations = new Set();
        psychologists.forEach((psychologist) => {
            const specialization = psychologist.psychologist?.psychologistProfile?.specialization;
            if (specialization) {
                specializations.add(specialization);
            }
        });

        res.status(200).json({ success: true, data: Array.from(specializations) });
    } catch (error) {
        console.error("Error fetching unique specializations:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const getPsychologistById = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const psychologist = await User.findOne({ _id: doctorId, role: "psychologist" }).select("-password");

        if (!psychologist) {
            return res.status(404).json({
                success: false,
                message: "Psychologist not found",
            });
        }

        res.status(200).json({
            success: true,
            data: psychologist,
        });
    } catch (error) {
        console.error("Error fetching psychologist by ID:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const saveAppointment = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "Error parsing form data", error: err });
        }

        try {
            const { patientId, psychologistId, scheduleId, symptoms } = req.body;

            if (!patientId || !psychologistId || !scheduleId || !symptoms) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // Validate ObjectIds
            if (
                !mongoose.Types.ObjectId.isValid(patientId) ||
                !mongoose.Types.ObjectId.isValid(psychologistId) ||
                !mongoose.Types.ObjectId.isValid(scheduleId)
            ) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            // Fetch schedule details
            const availability = await Availability.findById(scheduleId);
            if (!availability) {
                return res.status(404).json({ message: "Schedule not found" });
            }

            // Check if the schedule is already booked
            if (availability.isBooked) {
                return res.status(400).json({ message: "Schedule already booked" });
            }

            // Mark schedule as booked
            availability.isBooked = true;
            await availability.save();

            const psychologist = await User.findById(psychologistId);
            if (!psychologist) {
                return res.status(404).json({ message: "Psychologist not found" });
            }

            const patient = await User.findById(patientId);
            if (!patient) {
                return res.status(404).json({ message: "Patient not found" });
            }

            // Create new appointment
            const newAppointment = new Appointment({
                patientId: patientId,
                psychologistId,
                availabilityId: availability.id,
                scheduledTime: {
                    date: availability.date,
                    startTime: availability.startTime,
                    endTime: availability.endTime,
                },
                status: "Pending",
                note: symptoms,
            });

            // Save to database
            const savedAppointment = await newAppointment.save();

            // Set expiration time (5 minutes from now)
            const expiredAt = Math.floor(Date.now() / 1000) + 1440 * 60; // Unix Timestamp

            const paymentBody = {
                amount: 350000,
                description: "Tu van truc tuyen",
                items: [
                    {
                        name: `Buổi tư vấn với tư vấn viên ${psychologist.fullName}`,
                        quantity: 1,
                        price: 350000,
                    },
                ],
                expiredAt,
            };

            const paymentInfo = await createPaymentLink(paymentBody);
            savedAppointment.paymentInformation = paymentInfo;
            await savedAppointment.save();

            res.status(201).json({
                message: "Appointment booked successfully!",
                appointmentId: savedAppointment._id,
                expiredAt,
            });
        } catch (error) {
            console.error("Error saving appointment:", error);
            res.status(500).json({ message: "Server error. Please try again later." });
        }
    });
};

export const getAppointmentById = async (req, res) => {
    const { appointmentId } = req.params; // Get the appointment ID from request params

    try {
        // Find the appointment by ID and populate related fields
        const appointment = await Appointment.findById(appointmentId).populate("patientId psychologistId");

        // If appointment not found, return an error
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Extract orderCode from paymentInformation if it exists
        const orderCode = appointment.paymentInformation?.orderCode || null;

        // Return the found appointment along with the order code
        res.status(200).json(appointment);
    } catch (error) {
        // Handle any errors that occur during the query
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching the appointment" });
    }
};

export const getAppointmentList = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate({
                path: "patientId",
                select: "fullName email",
                match: { _id: { $exists: true, $type: "objectId" } }, // Ensure valid ObjectId
                strictPopulate: false,
            })
            .populate({
                path: "psychologistId",
                select: "fullName email",
                match: { _id: { $exists: true, $type: "objectId" } }, // Ensure valid ObjectId
                strictPopulate: false,
            })
            .sort({ "scheduledTime.date": 1 });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments", error });
    }
};

export default {
    getPsychologistList,
    getUniqueSpecializations,
    getPsychologistById,
    saveAppointment,
    getAppointmentById,
    getAppointmentList,
};

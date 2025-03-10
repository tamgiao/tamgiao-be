import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import Availability from "../models/availability.model.js";
import mongoose from "mongoose";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    // Use multer to handle multipart form data
    upload.fields([
        { name: "symptoms", maxCount: 1 },
        { name: "images", maxCount: 3 },
    ])(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "Error handling file upload", error: err });
        }
        try {
            const { userId, psychologistId, scheduleId, symptoms } = req.body;

            if (!userId || !psychologistId || !scheduleId || !symptoms) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // Validate ObjectIds
            if (
                !mongoose.Types.ObjectId.isValid(userId) ||
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

            // Create new appointment
            const newAppointment = new Appointment({
                patientId: userId,
                psychologistId,
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

            res.status(201).json({
                message: "Appointment booked successfully!",
                appointmentId: savedAppointment._id,
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
        // Find the appointment by ID
        const appointment = await Appointment.findById(appointmentId).populate("patientId psychologistId");

        // If appointment not found, return an error
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Return the found appointment
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

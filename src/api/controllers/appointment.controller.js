import Appointment from "../models/appointment.model.js";
import Availability from "../models/availability.model.js";
import { cancelPaymentLink } from "../services/payOS.service.js";
import PayOS from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

const payOS = new PayOS(clientId, apiKey, checksumKey);

const paymentTimers = new Map(); // Global Map to store timers

export const createPaymentLink = async (req, res) => {
    try {
        const { amount, description, items } = req.body;
        const orderCode = Number(String(Date.now()).slice(-6));

        // Validate required fields
        if (!amount || !description || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Thời gian hết hạn (15 phút từ thời điểm hiện tại)
        const expiredAt = Math.floor(Date.now() / 1000) + 15 * 60; // Unix Timestamp

        const body = {
            orderCode,
            amount,
            description,
            items,
            expiredAt,
            returnUrl: "https://tamgiao.github.io/tamgiao/",
            cancelUrl: "https://tamgiao.github.io/tamgiao/#/CategoryTestSelected",
        };

        // Create payment link
        const paymentResponse = await payOS.createPaymentLink(body);

        if (!paymentResponse || !paymentResponse.checkoutUrl) {
            return res.status(500).json({ message: "Failed to generate payment link" });
        }

        res.status(201).send(paymentResponse);
    } catch (error) {
        console.error("Error creating payment link:", error);
        res.status(500).json({ message: "Server error. Please try again later.", error: error.message });
    }
};

export const checkPaymentStatus = async (req, res) => {
    try {
        const { orderCode } = req.body;

        if (!orderCode) {
            return res.status(400).json({ message: "Missing orderCode" });
        }

        const paymentStatus = await payOS.getPaymentLinkInformation(orderCode);

        if (!paymentStatus) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json({ status: paymentStatus.status });
    } catch (error) {
        console.error("Error checking payment status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const updateData = req.body;

        // Find and update the appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { $set: updateData },
            { new: true, runValidators: true } // Return the updated document and apply schema validation
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({
            message: "Appointment updated successfully",
            appointment: updatedAppointment,
        });
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export const waitForPayment = async (req, res) => {
    try {
        const { appointmentId, scheduleId, expiredAt } = req.body;

        if (!appointmentId || !scheduleId || !expiredAt) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = expiredAt - currentTime;

        if (timeRemaining <= 0) {
            return res.status(400).json({ message: "Expiration time must be in the future" });
        }

        console.log(`Waiting for payment... Appointment ID: ${appointmentId}, Expires in: ${timeRemaining} seconds`);

        // Set expiration timer
        const timer = setTimeout(async () => {
            try {
                const appointment = await Appointment.findById(appointmentId);
                if (!appointment) {
                    console.log(`Appointment ${appointmentId} not found`);
                    return;
                }

                if (appointment.status === "Confirmed") {
                    console.log(`Appointment ${appointmentId} is already paid. No further action needed.`);
                    return;
                }

                // Mark appointment as expired
                appointment.status = "Cancelled";
                await appointment.save();

                // Mark availability as not booked (since the appointment expired)
                const availability = await Availability.findById(scheduleId);
                if (availability) {
                    availability.isBooked = false;
                    await availability.save();
                }

                console.log(`Appointment ${appointmentId} expired. Schedule ${scheduleId} is now available.`);

                // Remove from active timers
                paymentTimers.delete(appointmentId);
            } catch (error) {
                console.error(`Error handling expiration for appointment ${appointmentId}:`, error);
            }
        }, timeRemaining * 1000);

        // Store the timer reference
        paymentTimers.set(appointmentId, timer);

        res.status(200).json({ message: "Payment timer started", expiresIn: timeRemaining });
    } catch (error) {
        console.error("Error in waitForPayment function:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === "Confirmed") {
            return res.status(400).json({ message: "Appointment is already confirmed" });
        }

        // Mark as confirmed
        appointment.status = "Confirmed";
        await appointment.save();

        // Cancel expiration timer
        if (paymentTimers.has(appointmentId)) {
            clearTimeout(paymentTimers.get(appointmentId)); // Cancel the timer
            paymentTimers.delete(appointmentId); // Remove from active timers
            console.log(`Payment received. Timer cleared for Appointment ${appointmentId}`);
        }

        res.status(200).json({ message: "Payment confirmed, appointment booked" });
    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export const cancelPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ message: "Missing appointmentId" });
        }

        // Find the appointment to get the associated availabilityId
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const scheduleId = appointment.availabilityId; // Get availabilityId from the appointment
        const orderCode = appointment.paymentInformation.orderCode;

        cancelPaymentLink(orderCode);

        // Update the appointment status to "Cancelled"
        appointment.status = "Cancelled";
        await appointment.save();

        // Update the availability slot's `isBooked` to false
        const availability = await Availability.findByIdAndUpdate(scheduleId, { isBooked: false }, { new: true });

        if (!availability) {
            return res.status(404).json({ message: "Availability slot not found" });
        }

        if (paymentTimers.has(appointmentId)) {
            clearTimeout(paymentTimers.get(appointmentId)); // Cancel the timer
            paymentTimers.delete(appointmentId); // Remove from active timers
            console.log(`Payment cancelled. Timer cleared for Appointment ${appointmentId}`);
        }

        return res.status(200).json({ message: "Payment canceled successfully", appointment, availability });
    } catch (error) {
        console.error("Error canceling payment:", error);
        return res.status(500).json({ message: "An error occurred while canceling payment" });
    }
};

export const checkPendingAppointmentByUserId = async (req, res) => {
    try {
        const { userId, maxPendingLimit } = req.body; // Get userId and maxPendingLimit from request body

        if (!userId || !maxPendingLimit) {
            return res.status(400).json({ message: "Missing userId or maxPendingLimit" });
        }

        // Count pending appointments for the user
        const pendingCount = await Appointment.countDocuments({
            patientId: userId,
            status: "Pending",
        });

        // Check if they can book more
        const canBookMore = pendingCount < parseInt(maxPendingLimit, 10);

        res.json({
            pendingCount,
            canBookMore,
            message: canBookMore
                ? "User can book more appointments."
                : "User has reached the pending appointment limit.",
        });
    } catch (error) {
        console.error("Error checking pending appointments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAppointmentListByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from request params

        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        // Fetch all appointments for the given patientId
        const appointments = await Appointment.find({ patientId: userId })
            .populate("psychologistId", "name email") // Populate psychologist details
            .populate("availabilityId") // Populate availability details
            .sort({ createdAt: -1 }); // Sort by latest appointments

        return res.status(200).json({ message: "Appointments retrieved successfully", appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({ message: "An error occurred while fetching appointments" });
    }
};

export default {
    createPaymentLink,
    checkPaymentStatus,
    updateAppointment,
    waitForPayment,
    confirmPayment,
    cancelPayment,
    checkPendingAppointmentByUserId,
    getAppointmentListByUserId,
};

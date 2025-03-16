import mongoose, { Schema } from "mongoose";

// Appointment schema
const AppointmentSchema = new Schema(
    {
        patientId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "users", // Assuming "User" model for patients
        },
        psychologistId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "users", // Assuming "User" model for psychologists
        },
        availabilityId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "availabilities", // Reference to the availability slot
        },
        paymentInformation: {
            orderCode: {
                type: Number,
            },
            description: {
                type: String,
            },
            expiredAt: {
                type: Number, // Unix timestamp
            },
            checkoutUrl: {
                type: String,
            },
        },
        scheduledTime: {
            date: {
                type: Date,
                required: true,
            },
            startTime: {
                type: String,
                required: true,
            },
            endTime: {
                type: String,
                required: true,
            },
        },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
            default: "Pending", // Default status is "Pending"
        },
        note: {
            type: String,
            required: false, // The note field is optional
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create the Appointment model
const Appointment = mongoose.model("appointments", AppointmentSchema);

export default Appointment;

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
                type: String,
            },
            description: {
                type: String,
            },
            expiredAt: {
                type: Number, // Unix timestamp
            },
            amount: {
                type: Number,
                default: 350000,
            },
            status: {
                type: String,
                enum: ["PENDING", "PAID", "CANCELLED", "EXPIRED"],
                default: "PENDING",
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
                type: Date, //ban đầu đang là String, đổi lại thành Date
                required: true,
            },
            endTime: {
                type: Date, //ban đầu đang là String, đổi lại thành Date
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
        meetingURL: {
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

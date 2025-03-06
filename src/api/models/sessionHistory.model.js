import mongoose, { Schema } from "mongoose";

// SessionHistory schema
const SessionHistorySchema = new Schema(
    {
        patientId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "users", // Assuming "User" is the model for patients
        },
        psychologistId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "users", // Assuming "User" is the model for psychologists
        },
        appointmentId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "appointments", // Assuming "Appointment" is the model for appointments
        },
        note: {
            type: String,
            required: true, // A note is required for the outcome
        },
        outcome: {
            type: String,
            required: true, // Outcome must be specified
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create the SessionHistory model
const SessionHistory = mongoose.model("sessionhistories", SessionHistorySchema);

export default SessionHistory;

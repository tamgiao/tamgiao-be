import mongoose, { Schema } from "mongoose";

// Availability schema
const AvailabilitySchema = new Schema(
    {
        psychologistId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: Date,
            required: true, // Store the exact start time for the availability
        },
        endTime: {
            type: Date,
            required: true, // Store the exact end time for the availability
        },
        isBooked: {
            type: Boolean,
            default: false, // Default is false, meaning the time slot is available
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create the Availability model
const Availability = mongoose.model("availabilities", AvailabilitySchema);

export default Availability;

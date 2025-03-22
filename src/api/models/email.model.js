import mongoose, { Schema } from "mongoose";

// Main User schema
const EmailSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create the User model
const Email = mongoose.model("emails", EmailSchema);

export default Email;

import mongoose, { Schema } from "mongoose";
import { type } from "os";

// Medical profile schema for patients
const MedicalProfileSchema = new Schema(
    {
        issue: { type: String, required: true },
        diagnose: { type: String, required: true },
        therapeuticGoal: { type: String, required: true },
        psychosocialHistory: { type: String, required: true },
        note: { type: String, required: true },
    },
    { _id: false } // Prevent creating an ID for this subdocument
);

// Psychologist schema for psychologists
const PsychologistProfileSchema = new Schema(
    {
        overallProfile: { type: String },
        professionalLevel: { type: String, required: true },
        educationalLevel: { type: String, required: true },
        specialization: { type: String, required: true },
        rating: { type: Number, required: true },
        numberOfRatings: { type: Number, default: 0 },
        appointmentsAttended: { type: Number, default: 0 },
        consultationsCount: { type: Number, default: 0 },
        medicalExperience: { type: [String], default: [] },
        workHistory: { type: [String], default: [] },
    },
    { _id: false } // Prevent creating an ID for this subdocument
);

// Main User schema
const UserSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female"],
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        dob: {
            type: Date,
            required: false,
        },
        profileImg: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Inactive",
        },
        role: {
            type: String,
            enum: ["user", "admin", "staff", "patient", "psychologist"],
            default: "user",
            required: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false, // New users are not verified by default
        },
        isPhoneVerified: {
            type: Boolean,
            default: false, // New users are not verified by default
        },
        emailVerificationCode: {
            type: String,
            required: false,
            default: null,
        },
        phoneVerificationCode: {
            type: String,
            required: false,
            default: null,
        },
        patient: {
            type: new Schema(
                {
                    medicalProfile: { type: MedicalProfileSchema, required: true },
                },
                { _id: false }
            ),
            // required: function () {
            //     return this.role === "patient";
            // },
        },
        psychologist: {
            type: new Schema(
                {
                    psychologistProfile: { type: PsychologistProfileSchema, required: true },
                },
                { _id: false }
            ),
            // required: function () {
            //     return this.role === "psychologist";
            // },
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Add validation hook to enforce structure
// UserSchema.pre("save", function (next) {
//     if (this.role === "patient" && !this.patient) {
//         return next(new Error("A patient must have a medical profile."));
//     }

//     if (this.role === "psychologist" && !this.psychologist) {
//         return next(new Error("A psychologist must have a psychologist profile."));
//     }

//     if ((this.role === "admin" || this.role === "manager") && (this.patient || this.psychologist)) {
//         return next(new Error(`Users with role '${this.role}' cannot have patient or psychologist profiles.`));
//     }

//     next();
// });

// Create the User model
const User = mongoose.model("users", UserSchema);

export default User;

import mongoose, { Schema } from "mongoose";

// Test Outcome Schema
const TestOutcomeSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
        },
        minScore: {
            type: Number,
            required: true,
        },
        maxScore: {
            type: Number,
            required: true,
        },
    },
    { _id: false } // Prevent creating an ID for the test outcome subdocument
);

// Main Test schema
const TestSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories", // Referring to the Category collection
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        testOutcomes: [TestOutcomeSchema], // Embedding the TestOutcomeSchema for test outcomes array
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create the Test model
const Test = mongoose.model("tests", TestSchema);

export default Test;

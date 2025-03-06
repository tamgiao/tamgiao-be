import mongoose, { Schema } from "mongoose";

// Answer Schema for storing possible answers to the question
const AnswerSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        point: {
            type: Number,
            required: true,
        },
    },
    { _id: false } // Prevent creating an ID for the answer subdocument
);

// Main Question schema
const QuestionSchema = new Schema(
    {
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tests", // Referring to the Test collection
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories", // Referring to the Category collection
            required: true,
        },
        answers: [AnswerSchema], // Embedding the AnswerSchema for storing possible answers
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create the Question model
const Question = mongoose.model("questions", QuestionSchema);

export default Question;

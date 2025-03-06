import mongoose, { Schema } from "mongoose";

// Answer selection schema for the question
const SelectedAnswerSchema = new Schema(
    {
        answer: {
            type: String,
            required: true,
        },
    },
    { _id: false } // Prevent creating an ID for the selected answer subdocument
);

// Question schema for the questions in the test
const QuestionSchema = new Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "questions", // Referring to the Question collection
            required: true,
        },
        // content: {
        //     type: String,
        //     required: true,
        // },
        selectedAnswer: SelectedAnswerSchema, // Embedding the SelectedAnswerSchema
    },
    { _id: false } // Prevent creating an ID for the question subdocument
);

// Test outcome schema for the result of the test
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
    { _id: false } // Prevent creating an ID for this subdocument
);

// Main TestHistory schema
const TestHistorySchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users", // Referring to the User collection
            required: true,
        },
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tests", // Referring to the Test collection
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        testOutcome: TestOutcomeSchema, // Embedding the TestOutcome schema
        questions: [QuestionSchema], // Embedding the Question schema
        commentAI: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create the TestHistory model
const TestHistory = mongoose.model("testhistories", TestHistorySchema);

export default TestHistory;

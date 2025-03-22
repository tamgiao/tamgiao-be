import mongoose, { Schema } from "mongoose";

// Comment schema for each comment in the post
const CommentSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users", // Referring to the User collection
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        createAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false } // Prevent creating an ID for the comment subdocument
);

// Main BlogPost schema
const BlogPostSchema = new Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        title: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
            required: false,
        },
        image: {
            type: String,
            required: false,
        },
        content: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            required: false,
        },
        status: {
            type: String,
            enum: ["Draft", "Published"],
            default: "Draft", // Default status is "Draft"
        },
        comments: [CommentSchema],
    },
    {
        timestamps: true,
    }
);

// Create the Post model
const BlogPost = mongoose.model("blogposts", BlogPostSchema);

export default BlogPost;

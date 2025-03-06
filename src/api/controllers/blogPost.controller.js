import BlogPost from "../models/blogPost.model.js"; // Import BlogPost model
import { body, validationResult } from "express-validator";

const getAllBlog = async (req, res) => {
    try {
        const blogPosts = await BlogPost.find();
        res.status(200).json(blogPosts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getBlogDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const blogPost = await BlogPost.findById(id);
        if (!blogPost) {
            return res.status(404).json({ message: "Blog post not found" });
        }

        res.status(200).json(blogPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { postId } = req.params; // ID của bài viết cần thêm bình luận
        const { userId, username, comment } = req.body;

        const blogPost = await BlogPost.findById(postId);
        if (!blogPost) {
            return res.status(404).json({ error: "Bài viết không tồn tại" });
        }

        const newComment = {
            userId,
            username,
            comment,
            createdAt: new Date(),
        };

        blogPost.comments.push(newComment);
        await blogPost.save();

        res.status(201).json(blogPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
const updateComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { comment } = req.body;

        const blogPost = await BlogPost.findById(postId);
        if (!blogPost) {
            return res.status(404).json({ error: "Bài viết không tồn tại" });
        }

        const commentIndex = blogPost.comments.findIndex((c) => c._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ error: "Bình luận không tồn tại" });
        }

        blogPost.comments[commentIndex].comment = comment;
        await blogPost.save();

        res.status(200).json(blogPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        const blogPost = await BlogPost.findById(postId);
        if (!blogPost) {
            return res.status(404).json({ error: "Bài viết không tồn tại" });
        }

        const commentIndex = blogPost.comments.findIndex((c) => c._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ error: "Bình luận không tồn tại" });
        }

        // Xóa bình luận khỏi mảng
        blogPost.comments.splice(commentIndex, 1);
        await blogPost.save();

        res.status(200).json({ message: "Bình luận đã bị xóa", blogPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Controller to create a new blog post with validation
const createBlogPost = [
    // Validation rules
    body("title").isString().withMessage("Title must be a string").notEmpty().withMessage("Title is required"),
    body("userId")
        .isMongoId()
        .withMessage("UserId must be a valid MongoDB ObjectId")
        .notEmpty()
        .withMessage("UserId is required"),
    // body("userId").isMongoId().withMessage("UserId must be a valid MongoDB ObjectId").notEmpty().withMessage("UserId is required"),
    body("content").isString().withMessage("Content must be a string").notEmpty().withMessage("Content is required"),
    body("status").optional().isIn(["Draft", "Published"]).withMessage("Status must be either 'Draft' or 'Published'"),

    // Controller to create a new blog post
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, userId, image, content, status } = req.body;

            // Create a new blog post instance
            const newBlogPost = new BlogPost({
                title,
                userId,
                image,
                content,
                status,
            });

            // Save the new blog post to the database
            const savedBlogPost = await newBlogPost.save();

            // Send the saved blog post as the response
            res.status(201).json(savedBlogPost);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error while creating the blog post." });
        }
    },
];

// Validation rules for update
const updateBlogPostValidation = [
    body("title").optional().isString().withMessage("Title must be a string"),
    body("content").optional().isString().withMessage("Content must be a string"),
    body("status").optional().isIn(["Draft", "Published"]).withMessage("Status must be either 'Draft' or 'Published'"),
];

// Controller to update a blog post
const updateBlogPost = [
    // Validation middleware
    ...updateBlogPostValidation,

    // Controller to handle the update
    async (req, res) => {
        const { id } = req.params; // Lấy ID từ tham số route
        const { title, content, status, image } = req.body; // Lấy các trường cần cập nhật từ body

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Tìm và cập nhật bài viết
            const updatedBlogPost = await BlogPost.findByIdAndUpdate(
                id,
                {
                    title,
                    content,
                    status,
                    image,
                },
                { new: true }
            ); // Trả về bài viết đã cập nhật

            if (!updatedBlogPost) {
                return res.status(404).json({ message: "Blog post not found." });
            }

            res.status(200).json(updatedBlogPost); // Trả về bài viết đã được cập nhật
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error while updating the blog post." });
        }
    },
];

// Controller to get a blog post by ID
const getBlogPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await BlogPost.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Blog post not found." });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching blog post by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Lấy tất cả bài viết
const getAllBlogPosts = async (req, res) => {
    try {
        const posts = await BlogPost.find();
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default {
    createBlogPost,
    updateBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    getAllBlog,
    getBlogDetail,
    updateComment,
    addComment,
    deleteComment,
};

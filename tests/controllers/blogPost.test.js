import request from "supertest";
import app from  "../../src/app.js"; // Import app.js để chạy server

describe("BlogPost API", () => {
    let userId;

    beforeAll(async () => {
        // Tạo userId giả định hoặc giả lập một người dùng nếu cần
        // Ví dụ, bạn có thể tạo một người dùng trong MongoDB và lấy ID
        userId = "60f5e515b2fa4f89b6b283f0"; // Thay đổi theo ID hợp lệ trong database của bạn
    });

    test("should create a new blog post with valid data", async () => {
        const response = await request(app)
            .post("/api/blogposts/create")
            .send({
                title: "Test Blog Post",
                userId,
                image: "https://example.com/test-image.jpg",
                content: "This is a test content for the blog post.",
                status: "Published"
            })
            .timeout(10000)
            .expect(201); // Kiểm tra xem mã trạng thái là 201 (Created)

        expect(response.body).toHaveProperty("title", "Test Blog Post");
        expect(response.body).toHaveProperty("userId", userId);
        expect(response.body).toHaveProperty("content", "This is a test content for the blog post.");
        expect(response.body).toHaveProperty("status", "Published");
    });

    test("should return 400 if title is missing", async () => {
        const response = await request(app)
            .post("/api/blogposts/create")
            .send({
                userId,
                content: "This is a test content for the blog post."
            })
            .expect(400); // Kiểm tra xem mã trạng thái là 400 (Bad Request)

        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Title is required",
                    param: "title"
                }),
                expect.objectContaining({
                    msg: "Title must be a string",  
                    param: "title"
                })
            ])
        );
    });

    test("should return 400 if userId is invalid", async () => {
        const response = await request(app)
            .post("/api/blogposts/create")
            .send({
                title: "Test Blog Post",
                userId: "invalid-user-id", // ID không hợp lệ
                content: "This is a test content for the blog post."
            })
            .expect(400);

        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "UserId must be a valid MongoDB ObjectId",
                    param: "userId"
                })
            ])
        );
    });

    test("should return 400 if content is missing", async () => {
        const response = await request(app)
            .post("/api/blogposts/create")
            .send({
                title: "Test Blog Post",
                userId,
                status: "Published"
            })
            .expect(400);

        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Content is required",
                    param: "content"
                })
            ])
        );
    });

    test("should return 400 if status is invalid", async () => {
        const response = await request(app)
            .post("/api/blogposts/create")
            .send({
                title: "Test Blog Post",
                userId,
                content: "This is a test content for the blog post.",
                status: "InvalidStatus" // Trạng thái không hợp lệ
            })
            .expect(400);

        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Status must be either 'Draft' or 'Published'",
                    param: "status"
                })
            ])
        );
    });
}
);

describe("BlogPost API", () => {
    let postId;

    beforeAll(async () => {
        // Tạo một bài viết mới để lấy ID cho việc test GET và PUT
        const response = await request(app)
            .post("/api/blogposts/create")
            .send({
                title: "Test Blog Post",
                userId: "60f5e515b2fa4f89b6b283f0",  // Thay đổi với ID hợp lệ
                content: "Test content",
                status: "Draft"
            });
        postId = response.body._id;  // Lưu ID để dùng cho các test sau
    });

    test("should return 200 and a list of blog posts for GET /api/blogposts", async () => {
        const response = await request(app).get("/api/blogposts");
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  // Kiểm tra trả về là một mảng
    });

    test("should return 200 and a single blog post for GET /api/blogposts/:id", async () => {
        const response = await request(app).get(`/api/blogposts/${postId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("title", "Test Blog Post");
    });

    test("should return 200 and updated blog post for PUT /api/blogposts/:id", async () => {
        const response = await request(app)
            .put(`/api/blogposts/${postId}`)
            .send({ title: "Updated Title", content: "Updated content" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("title", "Updated Title");
    });
});

// tests/routes/blogPost.routes.test.js
import request from "supertest";
import app from "../../src/app.js"; // Đảm bảo đường dẫn đúng

describe("BlogPost Routes", () => {
    test("should return a 200 response for the /api/blogposts route", async () => {
        const response = await request(app).get("/api/blogposts");
        expect(response.status).toBe(200);  // Kiểm tra status trả về
    });
});

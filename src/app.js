import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import { handleBadRequest, handleNotFound, handleServerErrors, logRequestTime } from "./api/middlewares/index.js";
import router from "./api/routes/index.js";
import cors from "cors";

const app = express();
dotenv.config();

app.use(express.json({ limit: "5mb" })); // Đặt kích thước tối đa là 5MB
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(helmet()); // This sets X-Content-Type-Options by default

// Add Referrer-Policy and Content-Security-Policy explicitly
app.use(
    helmet.referrerPolicy({
        policy: "no-referrer-when-downgrade",
    })
);

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://source.zoom.us"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    })
);
app.set("json replacer", (key, value) => {
    if (typeof value === "object" && value !== null) {
        return JSON.parse(JSON.stringify(value));
    }
    return value;
});

// Đừng xóa phần dưới này
// const server = http.createServer(app);
// const socketIo = new Server(server, {
//     cors: {
//         origin: ["http://localhost:8081"],
//         methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//         credentials: true, // Enable credentials (important for cookies and authentication)
//     },
// });
// app.use(cors({
//     origin: ["http://localhost:8081"],
//     methods: "GET, POST, PUT, DELETE, OPTIONS",
// }))

const allowedOrigins = [
    "http://localhost:9999",
    "http://localhost:8081",
    "http://localhost:3000", // Thêm cổng 3000
    "http://localhost:5173",
    "https://tamgiao.github.io",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Nếu không có origin (ví dụ: khi gọi từ Postman), cho phép
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, origin);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use("/api", router);

// Sử dụng các middleware xử lý lỗi
app.use(handleBadRequest);
app.use(handleNotFound);
app.use(handleServerErrors);

export default app;

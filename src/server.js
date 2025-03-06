import dotenv from "dotenv";
import app from "./app.js";
import instanceMongoDb from "./api/database/connect.mongodb.js";

// Tải biến môi trường từ .env file
dotenv.config();

const PORT = process.env.PORT;
const HOSTNAME = "localhost";
// Ensure MongoDB is connected before starting the server
const startServer = async () => {
    await instanceMongoDb; // Wait for MongoDB connection

    app.listen(PORT, () => {
        console.log(`🚀 Server running at: http://${HOSTNAME}:${PORT}`);
    });
};

// Start the server
startServer();

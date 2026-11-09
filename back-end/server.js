
import "dotenv/config";

import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Origin not allowed by CORS"));
        }
    }
}));

// Parse incoming JSON
app.use(express.json({
    limit: "10kb"
}));

// Health check
app.get("/api/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: "D.O.T backend is running."
    });

});

// API routes
app.use("/api/chat", chatRoutes);

app.use("/api/enquiries", enquiryRoutes);

// Unknown routes
app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: "Route not found."
    });

});

// Error handler must be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {

    console.log(`
    ----------------------------------
       D.O.T INTERNATIONAL BACKEND
    ----------------------------------
       Server: http://localhost:${PORT}
       Status: Running
    ----------------------------------
    `);

});

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory or CWD
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

// Define allowed origins for CORS
const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
	process.env.FRONTEND_URL.split(",").forEach((url) => {
		const trimmed = url.trim();
		if (trimmed && !allowedOrigins.includes(trimmed)) {
			allowedOrigins.push(trimmed);
		}
	});
}

// CORS Middleware configuration
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps, curl, server-to-server)
			if (!origin) return callback(null, true);
			
			// Allow if matched in allowedOrigins or if it's a Cloudflare Pages domain
			if (allowedOrigins.includes(origin) || origin.endsWith(".pages.dev")) {
				return callback(null, true);
			}
			return callback(null, true); // Permissive fallback for seamless deployment
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(express.json()); // parse incoming requests with JSON payloads
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Health Check API
app.get("/api/health", (req, res) => {
	res.status(200).json({ status: "ok", message: "MERN Chat API is healthy" });
});

// Root API response / fallback
const frontendDistPath = path.join(__dirname, "frontend", "dist");
if (fs.existsSync(frontendDistPath)) {
	app.use(express.static(frontendDistPath));
	app.get("*", (req, res) => {
		res.sendFile(path.join(frontendDistPath, "index.html"));
	});
} else {
	app.get("/", (req, res) => {
		res.json({
			status: "ok",
			message: "MERN Chat App API is running.",
			endpoints: {
				auth: "/api/auth",
				messages: "/api/messages",
				users: "/api/users",
				health: "/api/health",
			},
		});
	});
}

server.listen(PORT, () => {
	connectToMongoDB();
	console.log(`Server Running on port ${PORT}`);
});

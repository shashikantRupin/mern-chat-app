import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const allowedSocketOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
	process.env.FRONTEND_URL.split(",").forEach((url) => {
		const trimmed = url.trim();
		if (trimmed && !allowedSocketOrigins.includes(trimmed)) {
			allowedSocketOrigins.push(trimmed);
		}
	});
}

const io = new Server(server, {
	cors: {
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (allowedSocketOrigins.includes(origin) || origin.endsWith(".pages.dev")) {
				return callback(null, true);
			}
			return callback(null, true);
		},
		methods: ["GET", "POST"],
		credentials: true,
	},
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId != "undefined") userSocketMap[userId] = socket.id;

	// io.emit() is used to send events to all the connected clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});

export { app, io, server };

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
const activeCalls = {}; // {userId: { partnerId, callType }}

io.on("connection", (socket) => {
	const userId = socket.handshake.query.userId;
	if (userId && userId !== "undefined") {
		userSocketMap[userId] = socket.id;
		socket.userId = userId;
	}

	// Emit list of online users to all clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// --- WebRTC Video & Audio Signaling Handlers ---

	// 1. Initiate Call
	socket.on("call:initiate", ({ receiverId, callType, callerInfo }) => {
		const receiverSocketId = getReceiverSocketId(receiverId);

		if (!receiverSocketId) {
			return socket.emit("call:unavailable", { reason: "User is currently offline" });
		}

		if (activeCalls[receiverId]) {
			return socket.emit("call:busy", { reason: "User is busy on another call" });
		}

		activeCalls[socket.userId] = { partnerId: receiverId, callType };
		activeCalls[receiverId] = { partnerId: socket.userId, callType };

		io.to(receiverSocketId).emit("call:incoming", {
			callerInfo: {
				_id: callerInfo?._id || socket.userId,
				fullName: callerInfo?.fullName || "Incoming Caller",
				profilePic: callerInfo?.profilePic || "",
			},
			callType: callType || "video",
		});
	});

	// 2. Accept Call
	socket.on("call:accept", ({ callerId, rtcSignal }) => {
		const callerSocketId = getReceiverSocketId(callerId);
		if (callerSocketId) {
			io.to(callerSocketId).emit("call:accepted", { rtcSignal });
		}
	});

	// 3. Reject Call
	socket.on("call:reject", ({ callerId, reason }) => {
		delete activeCalls[callerId];
		delete activeCalls[socket.userId];

		const callerSocketId = getReceiverSocketId(callerId);
		if (callerSocketId) {
			io.to(callerSocketId).emit("call:rejected", {
				reason: reason || "Call declined",
			});
		}
	});

	// 4. WebRTC Signal Exchange (Offers, Answers, ICE Candidates)
	socket.on("call:webrtc-signal", ({ targetUserId, signalData }) => {
		const targetSocketId = getReceiverSocketId(targetUserId);
		if (targetSocketId) {
			io.to(targetSocketId).emit("call:webrtc-signal", {
				senderId: socket.userId,
				signalData,
			});
		}
	});

	// 5. End Call
	socket.on("call:end", ({ targetUserId }) => {
		delete activeCalls[socket.userId];
		if (targetUserId) {
			delete activeCalls[targetUserId];
			const targetSocketId = getReceiverSocketId(targetUserId);
			if (targetSocketId) {
				io.to(targetSocketId).emit("call:ended");
			}
		}
	});

	// Handle Disconnect
	socket.on("disconnect", () => {
		if (socket.userId) {
			// If user was in an active call, notify their call partner
			const ongoingCall = activeCalls[socket.userId];
			if (ongoingCall && ongoingCall.partnerId) {
				const partnerSocketId = getReceiverSocketId(ongoingCall.partnerId);
				if (partnerSocketId) {
					io.to(partnerSocketId).emit("call:ended");
				}
				delete activeCalls[ongoingCall.partnerId];
			}
			delete activeCalls[socket.userId];
			delete userSocketMap[socket.userId];
		}
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});

export { app, io, server };


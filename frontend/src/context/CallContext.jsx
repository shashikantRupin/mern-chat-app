import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useSocketContext } from "./SocketContext";
import { useAuthContext } from "./AuthContext";
import { soundController } from "../utils/sound";
import toast from "react-hot-toast";

const CallContext = createContext();

export const useCallContext = () => {
	return useContext(CallContext);
};

const RTC_CONFIG = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
		{ urls: "stun:stun2.l.google.com:19302" },
		{ urls: "stun:stun3.l.google.com:19302" },
		{ urls: "stun:stun4.l.google.com:19302" },
	],
};

export const CallContextProvider = ({ children }) => {
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();

	// Call States: 'idle' | 'calling' | 'ringing' | 'connected'
	const [callState, setCallState] = useState("idle");
	const [callType, setCallType] = useState("video"); // 'video' | 'audio'
	const [caller, setCaller] = useState(null); // When receiving call: { _id, fullName, profilePic }
	const [callPartner, setCallPartner] = useState(null); // Active call partner
	const [localStream, setLocalStream] = useState(null);
	const [remoteStream, setRemoteStream] = useState(null);

	// Controls
	const [isMuted, setIsMuted] = useState(false);
	const [isVideoOff, setIsVideoOff] = useState(false);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [callDuration, setCallDuration] = useState(0);

	// Refs
	const pcRef = useRef(null);
	const localStreamRef = useRef(null);
	const iceCandidateQueue = useRef([]);
	const callTimerRef = useRef(null);
	const ringTimeoutRef = useRef(null);
	const screenTrackRef = useRef(null);

	// 1. Cleanup all streams, timers, and WebRTC peer connection
	const cleanupCall = useCallback(() => {
		soundController.stopRingtone();
		soundController.stopDialTone();

		if (callTimerRef.current) {
			clearInterval(callTimerRef.current);
			callTimerRef.current = null;
		}
		if (ringTimeoutRef.current) {
			clearTimeout(ringTimeoutRef.current);
			ringTimeoutRef.current = null;
		}

		if (screenTrackRef.current) {
			screenTrackRef.current.stop();
			screenTrackRef.current = null;
		}

		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach((track) => track.stop());
			localStreamRef.current = null;
		}

		if (pcRef.current) {
			pcRef.current.onicecandidate = null;
			pcRef.current.ontrack = null;
			pcRef.current.onconnectionstatechange = null;
			pcRef.current.close();
			pcRef.current = null;
		}

		iceCandidateQueue.current = [];
		setLocalStream(null);
		setRemoteStream(null);
		setCallState("idle");
		setCaller(null);
		setCallPartner(null);
		setIsMuted(false);
		setIsVideoOff(false);
		setIsScreenSharing(false);
		setCallDuration(0);
	}, []);

	// 2. Setup RTCPeerConnection instance
	const createPeerConnection = useCallback(
		(targetUserId) => {
			if (pcRef.current) {
				pcRef.current.close();
			}

			const pc = new RTCPeerConnection(RTC_CONFIG);
			pcRef.current = pc;

			// ICE Candidate generation
			pc.onicecandidate = (event) => {
				if (event.candidate && socket) {
					socket.emit("call:webrtc-signal", {
						targetUserId,
						signalData: {
							type: "ice-candidate",
							candidate: event.candidate,
						},
					});
				}
			};

			// Remote track received
			pc.ontrack = (event) => {
				if (event.streams && event.streams[0]) {
					setRemoteStream(event.streams[0]);
				}
			};

			pc.onconnectionstatechange = () => {
				if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
					cleanupCall();
				}
			};

			return pc;
		},
		[socket, cleanupCall]
	);

	// 3. Process queued ICE candidates after remote description is set
	const processQueuedCandidates = useCallback(async () => {
		if (pcRef.current && pcRef.current.remoteDescription) {
			while (iceCandidateQueue.current.length > 0) {
				const candidate = iceCandidateQueue.current.shift();
				try {
					await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
				} catch (e) {
					console.warn("Failed to add queued ICE candidate:", e);
				}
			}
		}
	}, []);

	// 4. Initiate an Outgoing Call
	const startCall = async (targetUser, type = "video") => {
		if (!targetUser || !targetUser._id) {
			return toast.error("Please select a user to call");
		}
		if (!socket) {
			return toast.error("Connecting to chat server, please wait...");
		}

		try {
			// Request local mic and camera (or just mic for audio call)
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: type === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
			});

			localStreamRef.current = stream;
			setLocalStream(stream);
			setCallType(type);
			setCallPartner(targetUser);
			setCallState("calling");
			setIsVideoOff(type === "audio");

			soundController.playDialTone();

			// Emit initiate event to target user
			socket.emit("call:initiate", {
				receiverId: targetUser._id,
				callType: type,
				callerInfo: {
					_id: authUser._id,
					fullName: authUser.fullName,
					profilePic: authUser.profilePic,
				},
			});

			// Outgoing ring timeout (40 seconds)
			ringTimeoutRef.current = setTimeout(() => {
				toast.error(`${targetUser.fullName} did not answer`);
				endCall();
			}, 40000);
		} catch (err) {
			console.error("Media permission error:", err);
			toast.error("Could not access camera/microphone. Please allow browser permissions.");
			cleanupCall();
		}
	};

	// 5. Accept an Incoming Call
	const acceptCall = async () => {
		if (!caller || !caller._id) return;
		soundController.stopRingtone();

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: callType === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
			});

			localStreamRef.current = stream;
			setLocalStream(stream);
			setCallPartner(caller);
			setCallState("connected");
			setIsVideoOff(callType === "audio");

			// Create peer connection and add local tracks
			const pc = createPeerConnection(caller._id);
			stream.getTracks().forEach((track) => pc.addTrack(track, stream));

			// Notify caller that call was accepted
			socket.emit("call:accept", {
				callerId: caller._id,
			});

			// Start Call Timer
			setCallDuration(0);
			callTimerRef.current = setInterval(() => {
				setCallDuration((prev) => prev + 1);
			}, 1000);
		} catch (err) {
			console.error("Error accepting call:", err);
			toast.error("Failed to access camera/microphone");
			rejectCall();
		}
	};

	// 6. Reject an Incoming Call
	const rejectCall = () => {
		soundController.stopRingtone();
		if (caller && socket) {
			socket.emit("call:reject", {
				callerId: caller._id,
				reason: "Call declined",
			});
		}
		cleanupCall();
	};

	// 7. End an Active or Outgoing Call
	const endCall = () => {
		soundController.playEndCallTone();
		const targetId = callPartner?._id || caller?._id;
		if (targetId && socket) {
			socket.emit("call:end", { targetUserId: targetId });
		}
		cleanupCall();
	};

	// 8. Toggle Audio Mute
	const toggleMute = () => {
		if (localStreamRef.current) {
			localStreamRef.current.getAudioTracks().forEach((track) => {
				track.enabled = !track.enabled;
			});
			setIsMuted((prev) => !prev);
		}
	};

	// 9. Toggle Video On/Off
	const toggleVideo = async () => {
		if (localStreamRef.current) {
			const videoTracks = localStreamRef.current.getVideoTracks();

			if (videoTracks.length > 0) {
				const nextState = !videoTracks[0].enabled;
				videoTracks.forEach((t) => (t.enabled = nextState));
				setIsVideoOff(!nextState);
			} else if (callState === "connected" && pcRef.current) {
				// If started as audio-only, request video track and add to peer connection
				try {
					const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
					const newVideoTrack = videoStream.getVideoTracks()[0];
					localStreamRef.current.addTrack(newVideoTrack);
					setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
					pcRef.current.addTrack(newVideoTrack, localStreamRef.current);
					setIsVideoOff(false);
					setCallType("video");
				} catch (err) {
					toast.error("Could not enable camera");
				}
			}
		}
	};

	// 10. Toggle Screen Share
	const toggleScreenShare = async () => {
		if (!pcRef.current || !localStreamRef.current) return;

		if (isScreenSharing) {
			// Stop screen share & revert to webcam
			if (screenTrackRef.current) {
				screenTrackRef.current.stop();
				screenTrackRef.current = null;
			}
			try {
				const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
				const webcamTrack = webcamStream.getVideoTracks()[0];
				const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === "video");
				if (sender) {
					sender.replaceTrack(webcamTrack);
				}
				localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
				localStreamRef.current.addTrack(webcamTrack);
				setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
				setIsScreenSharing(false);
			} catch (err) {
				console.error("Reverting webcam error:", err);
			}
		} else {
			// Start screen share
			try {
				const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
				const screenTrack = screenStream.getVideoTracks()[0];
				screenTrackRef.current = screenTrack;

				const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === "video");
				if (sender) {
					sender.replaceTrack(screenTrack);
				} else {
					pcRef.current.addTrack(screenTrack, localStreamRef.current);
				}

				screenTrack.onended = () => {
					toggleScreenShare();
				};

				setIsScreenSharing(true);
			} catch (err) {
				console.warn("Screen share cancelled/denied:", err);
			}
		}
	};

	// 11. Socket.io Event Listeners
	useEffect(() => {
		if (!socket) return;

		// Incoming Call
		const handleIncomingCall = ({ callerInfo, callType }) => {
			if (callState !== "idle") {
				return socket.emit("call:reject", {
					callerId: callerInfo._id,
					reason: "User is on another call",
				});
			}

			setCaller(callerInfo);
			setCallType(callType || "video");
			setCallState("ringing");
			soundController.playRingtone();
		};

		// Call Accepted by Receiver -> Caller creates WebRTC Offer
		const handleCallAccepted = async () => {
			soundController.stopDialTone();
			if (ringTimeoutRef.current) {
				clearTimeout(ringTimeoutRef.current);
				ringTimeoutRef.current = null;
			}

			setCallState("connected");

			// Start timer
			setCallDuration(0);
			callTimerRef.current = setInterval(() => {
				setCallDuration((prev) => prev + 1);
			}, 1000);

			if (!callPartner || !localStreamRef.current) return;

			try {
				const pc = createPeerConnection(callPartner._id);
				localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

				const offer = await pc.createOffer();
				await pc.setLocalDescription(offer);

				socket.emit("call:webrtc-signal", {
					targetUserId: callPartner._id,
					signalData: {
						type: "offer",
						sdp: offer,
					},
				});
			} catch (err) {
				console.error("Error creating WebRTC offer:", err);
				toast.error("Failed to connect call stream");
				endCall();
			}
		};

		// Call Rejected
		const handleCallRejected = ({ reason }) => {
			toast.error(reason || "Call was declined");
			cleanupCall();
		};

		// User Unavailable / Offline
		const handleCallUnavailable = ({ reason }) => {
			toast.error(reason || "User is unavailable");
			cleanupCall();
		};

		// User Busy
		const handleCallBusy = ({ reason }) => {
			toast.error(reason || "User is currently busy");
			cleanupCall();
		};

		// Call Ended by partner
		const handleCallEnded = () => {
			toast("Call ended", { icon: "📴" });
			cleanupCall();
		};

		// WebRTC Signaling Messages (Offer, Answer, Candidates)
		const handleWebRTCSignal = async ({ senderId, signalData }) => {
			if (!signalData) return;

			try {
				// Handle Offer (Receiver creates Answer)
				if (signalData.type === "offer") {
					let pc = pcRef.current;
					if (!pc) {
						pc = createPeerConnection(senderId);
						if (localStreamRef.current) {
							localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
						}
					}

					await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
					await processQueuedCandidates();

					const answer = await pc.createAnswer();
					await pc.setLocalDescription(answer);

					socket.emit("call:webrtc-signal", {
						targetUserId: senderId,
						signalData: {
							type: "answer",
							sdp: answer,
						},
					});
				}

				// Handle Answer (Caller receives Answer)
				else if (signalData.type === "answer") {
					if (pcRef.current) {
						await pcRef.current.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
						await processQueuedCandidates();
					}
				}

				// Handle ICE Candidate
				else if (signalData.type === "ice-candidate") {
					if (pcRef.current && pcRef.current.remoteDescription) {
						await pcRef.current.addIceCandidate(new RTCIceCandidate(signalData.candidate));
					} else {
						iceCandidateQueue.current.push(signalData.candidate);
					}
				}
			} catch (err) {
				console.error("WebRTC Signaling Error:", err);
			}
		};

		socket.on("call:incoming", handleIncomingCall);
		socket.on("call:accepted", handleCallAccepted);
		socket.on("call:rejected", handleCallRejected);
		socket.on("call:unavailable", handleCallUnavailable);
		socket.on("call:busy", handleCallBusy);
		socket.on("call:ended", handleCallEnded);
		socket.on("call:webrtc-signal", handleWebRTCSignal);

		return () => {
			socket.off("call:incoming", handleIncomingCall);
			socket.off("call:accepted", handleCallAccepted);
			socket.off("call:rejected", handleCallRejected);
			socket.off("call:unavailable", handleCallUnavailable);
			socket.off("call:busy", handleCallBusy);
			socket.off("call:ended", handleCallEnded);
			socket.off("call:webrtc-signal", handleWebRTCSignal);
		};
	}, [socket, callState, callPartner, caller, createPeerConnection, processQueuedCandidates, cleanupCall]);

	return (
		<CallContext.Provider
			value={{
				callState,
				callType,
				caller,
				callPartner,
				localStream,
				remoteStream,
				isMuted,
				isVideoOff,
				isScreenSharing,
				callDuration,
				startCall,
				acceptCall,
				rejectCall,
				endCall,
				toggleMute,
				toggleVideo,
				toggleScreenShare,
			}}
		>
			{children}
		</CallContext.Provider>
	);
};

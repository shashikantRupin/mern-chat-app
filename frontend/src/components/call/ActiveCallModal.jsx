import { useEffect, useRef, useState } from "react";
import { useCallContext } from "../../context/CallContext";
import { useThemeContext } from "../../context/ThemeContext";
import {
	FiMic,
	FiMicOff,
	FiVideo,
	FiVideoOff,
	FiPhoneOff,
	FiMaximize2,
	FiMinimize2,
	FiShare2,
} from "react-icons/fi";
import { handleImageError, getFallbackAvatar } from "../../utils/avatar";

const formatDuration = (secs) => {
	const mins = Math.floor(secs / 60);
	const remainingSecs = secs % 60;
	return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
};

const ActiveCallModal = () => {
	const {
		callState,
		callType,
		callPartner,
		caller,
		localStream,
		remoteStream,
		isMuted,
		isVideoOff,
		isScreenSharing,
		callDuration,
		endCall,
		toggleMute,
		toggleVideo,
		toggleScreenShare,
	} = useCallContext();

	const { isDark } = useThemeContext();
	const [isFullscreen, setIsFullscreen] = useState(false);

	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const modalContainerRef = useRef(null);

	const activePartner = callPartner || caller;

	// Attach local stream to video element
	useEffect(() => {
		if (localVideoRef.current && localStream) {
			localVideoRef.current.srcObject = localStream;
		}
	}, [localStream, callState]);

	// Attach remote stream to video element
	useEffect(() => {
		if (remoteVideoRef.current && remoteStream) {
			remoteVideoRef.current.srcObject = remoteStream;
		}
	}, [remoteStream, callState]);

	const toggleFullscreen = () => {
		if (!modalContainerRef.current) return;
		if (!document.fullscreenElement) {
			modalContainerRef.current.requestFullscreen?.().catch((e) => console.log(e));
			setIsFullscreen(true);
		} else {
			document.exitFullscreen?.().catch((e) => console.log(e));
			setIsFullscreen(false);
		}
	};

	// Only render for 'calling' (outgoing) or 'connected' states
	if (callState !== "calling" && callState !== "connected") return null;

	const isVideoCall = callType === "video";

	return (
		<div
			ref={modalContainerRef}
			className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in'
		>
			<div
				className={`relative w-full max-w-4xl h-[92vh] sm:h-[86vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 glass-panel
					${
						isDark
							? "bg-slate-900/90 border-slate-800 text-white shadow-indigo-950/40"
							: "bg-slate-900 border-slate-700 text-white"
					}`}
			>
				{/* Top Status Overlay Bar */}
				<div className='absolute top-0 inset-x-0 z-30 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-slate-800'>
							<img
								src={activePartner?.profilePic || getFallbackAvatar(activePartner?.fullName)}
								alt={activePartner?.fullName}
								className='w-full h-full object-cover'
								onError={(e) => handleImageError(e, activePartner?.fullName)}
							/>
						</div>
						<div>
							<h3 className='text-sm sm:text-base font-bold tracking-tight text-white drop-shadow-sm'>
								{activePartner?.fullName || "User"}
							</h3>
							<div className='flex items-center gap-1.5 text-xs text-slate-300'>
								<span
									className={`w-2 h-2 rounded-full ${
										callState === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"
									}`}
								></span>
								{callState === "connected" ? (
									<span className='font-mono font-medium'>{formatDuration(callDuration)}</span>
								) : (
									<span className='text-amber-300 font-medium'>Calling...</span>
								)}
							</div>
						</div>
					</div>

					{/* Fullscreen button */}
					<button
						type='button'
						onClick={toggleFullscreen}
						className='p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 transition-colors'
						title='Toggle Fullscreen'
					>
						{isFullscreen ? <FiMinimize2 className='w-4 h-4' /> : <FiMaximize2 className='w-4 h-4' />}
					</button>
				</div>

				{/* Center Main Stage (Video Feed / Voice Avatar) */}
				<div className='relative flex-1 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden'>
					{/* Outgoing Calling State Screen */}
					{callState === "calling" && (
						<div className='flex flex-col items-center justify-center text-center p-6 space-y-5 animate-fade-in'>
							<div className='relative'>
								<div className='absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping'></div>
								<div className='relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-indigo-500/60 shadow-2xl bg-slate-800'>
									<img
										src={activePartner?.profilePic || getFallbackAvatar(activePartner?.fullName)}
										alt={activePartner?.fullName}
										className='w-full h-full object-cover'
										onError={(e) => handleImageError(e, activePartner?.fullName)}
									/>
								</div>
							</div>
							<div>
								<h2 className='text-xl sm:text-2xl font-extrabold text-white'>
									Calling {activePartner?.fullName}...
								</h2>
								<p className='text-xs sm:text-sm text-slate-400 mt-1'>
									Waiting for recipient to accept the {isVideoCall ? "video" : "voice"} call
								</p>
							</div>
						</div>
					)}

					{/* Connected Video / Audio View */}
					{callState === "connected" && (
						<>
							{isVideoCall ? (
								<div className='relative w-full h-full flex items-center justify-center'>
									{/* Remote Video */}
									{remoteStream ? (
										<video
											ref={remoteVideoRef}
											autoPlay
											playsInline
											className='w-full h-full object-cover md:object-contain bg-slate-950'
										/>
									) : (
										<div className='flex flex-col items-center justify-center text-center p-6'>
											<div className='w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 mb-3'>
												<img
													src={activePartner?.profilePic || getFallbackAvatar(activePartner?.fullName)}
													alt={activePartner?.fullName}
													className='w-full h-full object-cover'
													onError={(e) => handleImageError(e, activePartner?.fullName)}
												/>
											</div>
											<p className='text-sm text-slate-400 font-medium'>Connecting camera stream...</p>
										</div>
									)}

									{/* Local Self-View PiP (Picture in Picture) */}
									<div className='absolute bottom-20 right-4 sm:bottom-24 sm:right-6 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 z-20'>
										{!isVideoOff && localStream ? (
											<video
												ref={localVideoRef}
												autoPlay
												playsInline
												muted
												className='w-full h-full object-cover scale-x-[-1]'
											/>
										) : (
											<div className='w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-xs p-2 text-center'>
												<FiVideoOff className='w-5 h-5 mb-1 text-slate-500' />
												<span>Camera Off</span>
											</div>
										)}
										<span className='absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm'>
											You
										</span>
									</div>
								</div>
							) : (
								/* Audio-Only Call Stage */
								<div className='flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in'>
									<div className='relative'>
										<div className='absolute -inset-4 rounded-full bg-emerald-500/20 animate-pulse'></div>
										<div className='relative w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl bg-slate-800'>
											<img
												src={activePartner?.profilePic || getFallbackAvatar(activePartner?.fullName)}
												alt={activePartner?.fullName}
												className='w-full h-full object-cover'
												onError={(e) => handleImageError(e, activePartner?.fullName)}
											/>
										</div>
									</div>

									<div className='space-y-1.5'>
										<h2 className='text-2xl font-bold text-white'>{activePartner?.fullName}</h2>
										<p className='text-emerald-400 font-mono text-sm'>{formatDuration(callDuration)}</p>
									</div>

									{/* Hidden audio element for remote stream in voice calls */}
									{remoteStream && (
										<audio
											ref={(audio) => {
												if (audio && remoteStream) audio.srcObject = remoteStream;
											}}
											autoPlay
										/>
									)}
								</div>
							)}
						</>
					)}
				</div>

				{/* Floating Bottom Control Action Bar */}
				<div className='shrink-0 p-4 sm:p-5 border-t border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-center gap-3 sm:gap-5 z-30'>
					{/* Mute Mic Toggle */}
					<button
						type='button'
						onClick={toggleMute}
						className={`p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center
							${
								isMuted
									? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
									: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
							}`}
						title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
					>
						{isMuted ? <FiMicOff className='w-5 h-5' /> : <FiMic className='w-5 h-5' />}
					</button>

					{/* Video Toggle (Only in video calls) */}
					{isVideoCall && (
						<button
							type='button'
							onClick={toggleVideo}
							className={`p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center
								${
									isVideoOff
										? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
										: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
								}`}
							title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
						>
							{isVideoOff ? <FiVideoOff className='w-5 h-5' /> : <FiVideo className='w-5 h-5' />}
						</button>
					)}

					{/* Screen Share Button (Only in video calls & connected) */}
					{isVideoCall && callState === "connected" && (
						<button
							type='button'
							onClick={toggleScreenShare}
							className={`hidden sm:flex p-3.5 rounded-2xl transition-all duration-200 items-center justify-center
								${
									isScreenSharing
										? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
										: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
								}`}
							title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
						>
							<FiShare2 className='w-5 h-5' />
						</button>
					)}

					{/* End Call Button */}
					<button
						type='button'
						onClick={endCall}
						className='px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold shadow-lg shadow-rose-600/30 transition-all duration-200 flex items-center gap-2'
						title='End Call'
					>
						<FiPhoneOff className='w-5 h-5' />
						<span className='hidden sm:inline text-sm'>End Call</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ActiveCallModal;

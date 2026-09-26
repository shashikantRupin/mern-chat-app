import { useCallContext } from "../../context/CallContext";
import { useThemeContext } from "../../context/ThemeContext";
import { FiPhone, FiPhoneOff, FiVideo } from "react-icons/fi";
import { handleImageError, getFallbackAvatar } from "../../utils/avatar";

const IncomingCallModal = () => {
	const { callState, callType, caller, acceptCall, rejectCall } = useCallContext();
	const { isDark } = useThemeContext();

	if (callState !== "ringing" || !caller) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in'>
			<div
				className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border flex flex-col items-center text-center overflow-hidden transition-all duration-300 glass-panel
					${
						isDark
							? "bg-slate-900/95 border-slate-700/80 text-white shadow-indigo-950/50"
							: "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60"
					}`}
			>
				{/* Ambient background glow */}
				<div className='absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none'></div>
				<div className='absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none'></div>

				{/* Pulsing Avatar */}
				<div className='relative my-4'>
					{/* Outer animated ripple rings */}
					<div className='absolute -inset-3 rounded-full bg-emerald-500/25 animate-ping'></div>
					<div className='absolute -inset-1.5 rounded-full bg-emerald-500/35 animate-pulse'></div>

					{/* Avatar Image */}
					<div className='relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-800 z-10'>
						<img
							src={caller.profilePic || getFallbackAvatar(caller.fullName)}
							alt={caller.fullName}
							className='w-full h-full object-cover'
							onError={(e) => handleImageError(e, caller.fullName)}
						/>
					</div>
				</div>

				{/* Caller Information */}
				<h3 className='text-lg sm:text-xl font-bold tracking-tight truncate max-w-full px-2'>
					{caller.fullName}
				</h3>

				<p className='text-xs sm:text-sm font-medium text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1.5'>
					{callType === "video" ? (
						<>
							<FiVideo className='w-4 h-4 animate-bounce' /> Incoming Video Call...
						</>
					) : (
						<>
							<FiPhone className='w-4 h-4 animate-bounce' /> Incoming Voice Call...
						</>
					)}
				</p>

				{/* Action Buttons: Decline & Accept */}
				<div className='flex items-center justify-center gap-8 mt-6 w-full pt-2'>
					{/* Decline Button */}
					<div className='flex flex-col items-center gap-1.5'>
						<button
							type='button'
							onClick={rejectCall}
							className='w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95'
							title='Decline Call'
						>
							<FiPhoneOff className='w-6 h-6' />
						</button>
						<span className='text-xs font-medium opacity-80'>Decline</span>
					</div>

					{/* Accept Button */}
					<div className='flex flex-col items-center gap-1.5'>
						<button
							type='button'
							onClick={acceptCall}
							className='w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 animate-pulse'
							title='Accept Call'
						>
							{callType === "video" ? <FiVideo className='w-6 h-6' /> : <FiPhone className='w-6 h-6' />}
						</button>
						<span className='text-xs font-medium opacity-80'>Accept</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IncomingCallModal;

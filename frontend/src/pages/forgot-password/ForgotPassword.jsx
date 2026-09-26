import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useForgotPassword from "../../hooks/useForgotPassword";
import { useThemeContext } from "../../context/ThemeContext";
import ThemeToggle from "../../components/common/ThemeToggle";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield, FiKey } from "react-icons/fi";
import { BsChatDotsFill } from "react-icons/bs";

const ForgotPassword = () => {
	const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [countdown, setCountdown] = useState(0);

	const { loading, sendOtp, resetPassword } = useForgotPassword();
	const { isDark } = useThemeContext();
	const navigate = useNavigate();

	useEffect(() => {
		let timer;
		if (countdown > 0) {
			timer = setTimeout(() => setCountdown(countdown - 1), 1000);
		}
		return () => clearTimeout(timer);
	}, [countdown]);

	const handleSendOtp = async (e) => {
		if (e) e.preventDefault();
		const success = await sendOtp(email);
		if (success) {
			setStep(2);
			setCountdown(60);
		}
	};

	const handleResendOtp = async () => {
		if (countdown > 0) return;
		const success = await sendOtp(email);
		if (success) {
			setCountdown(60);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		const success = await resetPassword({ email, otp, newPassword, confirmPassword });
		if (success) {
			navigate("/login");
		}
	};

	return (
		<div className='relative w-full max-w-md mx-auto'>
			{/* Ambient Glowing Blur Orbs */}
			<div className='absolute -top-10 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none'></div>
			<div className='absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none'></div>

			{/* Main Auth Card */}
			<div
				className={`relative z-10 w-full p-8 sm:p-10 rounded-3xl shadow-2xl border transition-all duration-300 glass-panel
					${
						isDark
							? "bg-slate-900/80 border-slate-800/80 text-white shadow-indigo-950/30"
							: "bg-white/80 border-slate-200/80 text-slate-900 shadow-slate-300/40"
					}`}
			>
				{/* Top Actions: Logo + Theme Toggle */}
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-2.5'>
						<div className='p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/30'>
							<BsChatDotsFill className='w-5 h-5' />
						</div>
						<span className='text-xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent'>
							ChatApp
						</span>
					</div>
					<ThemeToggle />
				</div>

				{/* Title & Step Badge */}
				<div className='mb-6'>
					<div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3'>
						{step === 1 ? <FiMail className='w-3.5 h-3.5' /> : <FiKey className='w-3.5 h-3.5' />}
						<span>{step === 1 ? "Step 1: Verification" : "Step 2: Reset Password"}</span>
					</div>
					<h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight'>
						{step === 1 ? "Forgot Password" : "Create New Password"}
					</h1>
					<p className={`text-xs sm:text-sm mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
						{step === 1
							? "Enter your registered email address and we'll send a 6-digit OTP."
							: `Enter the 6-digit code sent to ${email}`}
					</p>
				</div>

				{step === 1 ? (
					<form onSubmit={handleSendOtp} className='space-y-4'>
						<div>
							<label
								className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
									isDark ? "text-slate-300" : "text-slate-600"
								}`}
							>
								Email Address
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
									<FiMail className='w-4 h-4' />
								</span>
								<input
									type='email'
									placeholder='you@example.com'
									className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-200 outline-none
										${
											isDark
												? "bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20"
												: "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
										}`}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 border-none'
						>
							{loading ? (
								<span className='loading loading-spinner loading-sm'></span>
							) : (
								<>
									<FiShield className='w-4 h-4' /> Send Verification Code
								</>
							)}
						</button>

						<div className='text-center pt-2'>
							<Link
								to='/login'
								className={`text-xs sm:text-sm inline-flex items-center gap-1.5 hover:underline transition-colors ${
									isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
								}`}
							>
								<FiArrowLeft className='w-4 h-4' /> Back to Login
							</Link>
						</div>
					</form>
				) : (
					<form onSubmit={handleResetPassword} className='space-y-4'>
						{/* OTP code input */}
						<div>
							<div className='flex justify-between items-center mb-1.5'>
								<label
									className={`block text-xs font-semibold uppercase tracking-wider ${
										isDark ? "text-slate-300" : "text-slate-600"
									}`}
								>
									6-Digit OTP Code
								</label>
								<button
									type='button'
									onClick={() => setStep(1)}
									className='text-xs font-medium text-indigo-400 hover:underline'
								>
									Change email
								</button>
							</div>
							<input
								type='text'
								maxLength={6}
								placeholder='• • • • • •'
								className={`w-full py-3 text-center text-2xl font-mono tracking-widest font-bold rounded-xl border transition-all duration-200 outline-none
									${
										isDark
											? "bg-slate-800/80 border-slate-700 text-cyan-400 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
											: "bg-slate-50 border-slate-200 text-indigo-600 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
									}`}
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								required
							/>
						</div>

						{/* New Password */}
						<div>
							<label
								className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
									isDark ? "text-slate-300" : "text-slate-600"
								}`}
							>
								New Password
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
									<FiLock className='w-4 h-4' />
								</span>
								<input
									type={showPassword ? "text" : "password"}
									placeholder='Minimum 6 characters'
									className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border transition-all duration-200 outline-none
										${
											isDark
												? "bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20"
												: "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
										}`}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-300 transition-colors'
								>
									{showPassword ? <FiEyeOff className='w-4 h-4' /> : <FiEye className='w-4 h-4' />}
								</button>
							</div>
						</div>

						{/* Confirm Password */}
						<div>
							<label
								className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
									isDark ? "text-slate-300" : "text-slate-600"
								}`}
							>
								Confirm Password
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
									<FiLock className='w-4 h-4' />
								</span>
								<input
									type={showPassword ? "text" : "password"}
									placeholder='Re-type password'
									className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-200 outline-none
										${
											isDark
												? "bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20"
												: "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
										}`}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
							</div>
						</div>

						{/* Resend OTP counter */}
						<div className='flex justify-between items-center text-xs py-1'>
							<span className={isDark ? "text-slate-400" : "text-slate-500"}>Didn't get code?</span>
							{countdown > 0 ? (
								<span className='font-mono font-medium text-slate-400'>Resend in {countdown}s</span>
							) : (
								<button
									type='button'
									onClick={handleResendOtp}
									disabled={loading}
									className='font-semibold text-indigo-400 hover:underline'
								>
									Resend OTP
								</button>
							)}
						</div>

						{/* Submit button */}
						<button
							type='submit'
							disabled={loading}
							className='w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 border-none'
						>
							{loading ? (
								<span className='loading loading-spinner loading-sm'></span>
							) : (
								"Reset Password & Sign In"
							)}
						</button>

						<div className='text-center pt-2'>
							<Link
								to='/login'
								className={`text-xs sm:text-sm inline-flex items-center gap-1.5 hover:underline transition-colors ${
									isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
								}`}
							>
								<FiArrowLeft className='w-4 h-4' /> Back to Login
							</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default ForgotPassword;

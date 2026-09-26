import { useState } from "react";
import { Link } from "react-router-dom";
import GenderCheckbox from "./GenderCheckbox";
import useSignup from "../../hooks/useSignup";
import { useThemeContext } from "../../context/ThemeContext";
import ThemeToggle from "../../components/common/ThemeToggle";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { BsChatDotsFill } from "react-icons/bs";

const SignUp = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
		gender: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const { loading, signup } = useSignup();
	const { isDark } = useThemeContext();

	const handleCheckboxChange = (gender) => {
		setInputs({ ...inputs, gender });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await signup(inputs);
	};

	return (
		<div className='relative w-full max-w-md mx-auto my-4'>
			{/* Ambient Glowing Blur Orbs */}
			<div className='absolute -top-10 -left-10 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none'></div>
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
						<div className='p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/30'>
							<BsChatDotsFill className='w-5 h-5' />
						</div>
						<span className='text-xl font-bold tracking-tight bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent'>
							ChatApp
						</span>
					</div>
					<ThemeToggle />
				</div>

				{/* Title */}
				<div className='mb-5'>
					<h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight'>Create Account</h1>
					<p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
						Join ChatApp and connect with people in real-time
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='space-y-3.5'>
					{/* Full Name */}
					<div>
						<label
							className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
								isDark ? "text-slate-300" : "text-slate-600"
							}`}
						>
							Full Name
						</label>
						<div className='relative'>
							<span className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
								<FiUser className='w-4 h-4' />
							</span>
							<input
								type='text'
								placeholder='John Doe'
								className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-200 outline-none
									${
										isDark
											? "bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20"
											: "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
									}`}
								value={inputs.fullName}
								onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
								required
							/>
						</div>
					</div>

					{/* Email Address */}
					<div>
						<label
							className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
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
								value={inputs.email}
								onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
								required
							/>
						</div>
					</div>

					{/* Password */}
					<div>
						<label
							className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
								isDark ? "text-slate-300" : "text-slate-600"
							}`}
						>
							Password
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
								value={inputs.password}
								onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
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
							className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
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
								value={inputs.confirmPassword}
								onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
								required
							/>
						</div>
					</div>

					{/* Gender Selector */}
					<div>
						<label
							className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
								isDark ? "text-slate-300" : "text-slate-600"
							}`}
						>
							Gender
						</label>
						<GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />
					</div>

					{/* Submit button */}
					<button
						type='submit'
						disabled={loading}
						className='w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 group border-none'
					>
						{loading ? (
							<span className='loading loading-spinner loading-sm'></span>
						) : (
							<>
								Create Account
								<FiArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
							</>
						)}
					</button>

					{/* Link to Login */}
					<div className={`text-center pt-2 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
						Already have an account?{" "}
						<Link
							to='/login'
							className='font-semibold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors'
						>
							Sign in
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignUp;

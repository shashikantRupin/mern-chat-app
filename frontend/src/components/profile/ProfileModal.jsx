import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";
import { FiX, FiCamera, FiCheck, FiUser, FiMail, FiInfo, FiTrash2 } from "react-icons/fi";
import { PRESET_AVATARS, getFallbackAvatar, handleImageError } from "../../utils/avatar";
import { BACKEND_URL, getAuthHeaders } from "../../utils/constants";
import toast from "react-hot-toast";

const STATUS_PRESETS = [
	"🚀 Available",
	"💻 In a meeting",
	"☕ Coffee break",
	"🔥 Working on code",
	"🌙 Busy / DND",
	"✨ Living the best life",
];

const ProfileModal = ({ isOpen, onClose }) => {
	const { authUser, setAuthUser } = useAuthContext();
	const { isDark } = useThemeContext();

	const [fullName, setFullName] = useState(authUser?.fullName || "");
	const [bio, setBio] = useState(authUser?.bio || "🚀 Available to chat");
	const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef(null);

	// Synchronize input fields with current authUser when modal opens
	useEffect(() => {
		if (isOpen && authUser) {
			setFullName(authUser.fullName || "");
			setBio(authUser.bio || "🚀 Available to chat");
			setProfilePic(authUser.profilePic || "");
		}
	}, [isOpen, authUser]);

	if (!isOpen) return null;

	const handleImageChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 3 * 1024 * 1024) {
			return toast.error("Image size must be less than 3MB");
		}

		const reader = new FileReader();
		reader.onload = () => {
			setProfilePic(reader.result);
			toast.success("Image preview loaded!");
		};
		reader.readAsDataURL(file);
	};

	const handleRemovePhoto = () => {
		const defaultAvatar = getFallbackAvatar(fullName || "User");
		setProfilePic(defaultAvatar);
		toast.success("Photo reset to default initials avatar");
	};

	const handleSave = async (e) => {
		e.preventDefault();
		if (!fullName.trim()) {
			return toast.error("Full name cannot be empty");
		}

		setLoading(true);
		try {
			const finalProfilePic = profilePic || authUser.profilePic || getFallbackAvatar(fullName);
			const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
				method: "PUT",
				headers: getAuthHeaders({ "Content-Type": "application/json" }),
				credentials: "include",
				body: JSON.stringify({
					fullName: fullName.trim(),
					profilePic: finalProfilePic,
					bio: bio.trim(),
				}),
			});

			const data = await res.json();
			if (!res.ok || data.error) {
				throw new Error(data.error || "Failed to update profile");
			}

			const updatedUser = {
				...authUser,
				...data,
				token: authUser?.token,
			};

			localStorage.setItem("chat-user", JSON.stringify(updatedUser));
			setAuthUser(updatedUser);
			toast.success("Profile updated successfully!");
			onClose();
		} catch (error) {
			toast.error("Failed to update profile: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
			<div
				className={`relative w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-all duration-300 glass-panel
					${
						isDark
							? "bg-slate-900/95 border-slate-700/80 text-white shadow-indigo-950/40"
							: "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60"
					}`}
			>
				{/* 1. Fixed Sleek Header */}
				<div
					className={`shrink-0 px-6 py-4 border-b flex items-center justify-between transition-colors
						${isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-slate-50/90 border-slate-200 text-slate-900"}`}
				>
					<div className='flex items-center gap-3'>
						<div className='p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20 flex items-center justify-center'>
							<FiUser className='w-5 h-5' />
						</div>
						<div>
							<h2 className='text-base sm:text-lg font-bold leading-tight'>Edit Profile</h2>
							<p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
								Customize your photo, name, and status
							</p>
						</div>
					</div>
					<button
						type='button'
						onClick={onClose}
						className={`p-2 rounded-xl border transition-colors
							${
								isDark
									? "border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
									: "border-slate-200 hover:bg-slate-200/70 text-slate-500 hover:text-slate-900"
							}`}
					>
						<FiX className='w-5 h-5' />
					</button>
				</div>

				{/* 2. Scrollable Modal Body */}
				<div className='flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-5'>
					{/* Avatar Section - Clean and Non-overlapping */}
					<div
						className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl border transition-colors
							${isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-slate-50/70 border-slate-200/80"}`}
					>
						<div className='relative group shrink-0'>
							<div className='w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-indigo-500/40 ring-4 ring-indigo-500/10 shadow-lg bg-slate-800'>
								<img
									src={profilePic || authUser?.profilePic || getFallbackAvatar(fullName)}
									alt='Profile avatar'
									className='w-full h-full object-cover'
									onError={(e) => handleImageError(e, fullName)}
								/>
							</div>
							<button
								type='button'
								onClick={() => fileInputRef.current?.click()}
								className='absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-transform hover:scale-110'
								title='Upload custom photo'
							>
								<FiCamera className='w-3.5 h-3.5' />
							</button>
							<input
								type='file'
								ref={fileInputRef}
								onChange={handleImageChange}
								accept='image/*'
								className='hidden'
							/>
						</div>

						<div className='flex-1 text-center sm:text-left space-y-1.5'>
							<h3 className='text-sm font-semibold'>Profile Photo</h3>
							<p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
								Select an avatar preset below or upload a custom image.
							</p>
							<div className='flex flex-wrap justify-center sm:justify-start gap-2 pt-1'>
								<button
									type='button'
									onClick={() => fileInputRef.current?.click()}
									className={`text-xs px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition-colors
										${
											isDark
												? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
												: "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
										}`}
								>
									<FiCamera className='w-3.5 h-3.5 text-indigo-500' /> Upload Photo
								</button>
								<button
									type='button'
									onClick={handleRemovePhoto}
									className={`text-xs px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition-colors
										${
											isDark
												? "border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-rose-400"
												: "border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-rose-500"
										}`}
								>
									<FiTrash2 className='w-3.5 h-3.5' /> Reset
								</button>
							</div>
						</div>
					</div>

					{/* Avatar Presets */}
					<div>
						<p
							className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
								isDark ? "text-slate-400" : "text-slate-600"
							}`}
						>
							Avatar Presets
						</p>
						<div className='flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin'>
							{PRESET_AVATARS.map((avatarUrl, idx) => (
								<button
									key={idx}
									type='button'
									onClick={() => setProfilePic(avatarUrl)}
									className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 shrink-0 shadow-sm
										${
											profilePic === avatarUrl
												? "border-blue-500 ring-2 ring-blue-500/40 scale-105"
												: "border-slate-700/40 opacity-85 hover:opacity-100"
										}`}
								>
									<img
										src={avatarUrl}
										alt={`Preset ${idx + 1}`}
										className='w-full h-full object-cover bg-slate-800'
										onError={(e) => handleImageError(e, `User ${idx + 1}`)}
									/>
								</button>
							))}
						</div>
					</div>

					{/* Form Inputs */}
					<form id='profile-form' onSubmit={handleSave} className='space-y-3.5'>
						{/* Full Name */}
						<div>
							<label
								className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
									isDark ? "text-slate-400" : "text-slate-600"
								}`}
							>
								Display Name
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
									<FiUser className='w-4 h-4' />
								</span>
								<input
									type='text'
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border transition-colors outline-none
										${
											isDark
												? "bg-slate-800/80 border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
												: "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
										}`}
									placeholder='Your name'
									required
								/>
							</div>
						</div>

						{/* Email (Read-only) */}
						<div>
							<label
								className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
									isDark ? "text-slate-400" : "text-slate-600"
								}`}
							>
								Email Address
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
									<FiMail className='w-4 h-4' />
								</span>
								<input
									type='email'
									value={authUser?.email || authUser?.username || ""}
									disabled
									className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border opacity-70 cursor-not-allowed
										${isDark ? "bg-slate-800/40 border-slate-700/60 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}
								/>
							</div>
						</div>

						{/* Bio / Status */}
						<div>
							<label
								className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
									isDark ? "text-slate-400" : "text-slate-600"
								}`}
							>
								About / Status
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
									<FiInfo className='w-4 h-4' />
								</span>
								<input
									type='text'
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									maxLength={80}
									className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border transition-colors outline-none
										${
											isDark
												? "bg-slate-800/80 border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
												: "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
										}`}
									placeholder='What’s on your mind?'
								/>
							</div>

							{/* Bio Presets */}
							<div className='flex flex-wrap gap-1.5 mt-2'>
								{STATUS_PRESETS.map((preset, idx) => (
									<button
										key={idx}
										type='button'
										onClick={() => setBio(preset)}
										className={`text-xs px-2.5 py-1 rounded-xl transition-colors border
											${
												bio === preset
													? "bg-blue-600 text-white border-blue-500 shadow-sm"
													: isDark
													? "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
													: "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
											}`}
									>
										{preset}
									</button>
								))}
							</div>
						</div>
					</form>
				</div>

				{/* 3. Fixed Footer with Always-Visible Action Buttons */}
				<div
					className={`shrink-0 px-5 sm:px-7 py-3.5 border-t flex items-center justify-end gap-3
						${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50/90 border-slate-200"}`}
				>
					<button
						type='button'
						onClick={onClose}
						className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border
							${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}
					>
						Cancel
					</button>
					<button
						type='submit'
						form='profile-form'
						disabled={loading}
						className='px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-2 border-none'
					>
						{loading ? (
							<span className='loading loading-spinner loading-xs'></span>
						) : (
							<>
								<FiCheck className='w-4 h-4' /> Save Changes
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProfileModal;

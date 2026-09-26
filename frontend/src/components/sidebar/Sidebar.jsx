import { useState } from "react";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import ThemeToggle from "../common/ThemeToggle";
import ProfileModal from "../profile/ProfileModal";
import { useAuthContext } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";
import { BsChatDotsFill } from "react-icons/bs";
import { FiEdit3 } from "react-icons/fi";

import { handleImageError } from "../../utils/avatar";

const Sidebar = () => {
	const { authUser } = useAuthContext();
	const { isDark } = useThemeContext();
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	return (
		<div
			className={`flex flex-col h-full w-full md:w-80 lg:w-96 p-3 sm:p-4 border-b md:border-b-0 md:border-r transition-colors duration-200
				${isDark ? "border-slate-800/80 bg-slate-900/40" : "border-slate-200/80 bg-white/40"}`}
		>
			{/* Top App Bar & Profile Trigger */}
			<div className='flex items-center justify-between pb-3 mb-2 border-b border-slate-700/20 dark:border-slate-800/60'>
				<div className='flex items-center gap-2.5'>
					<div className='p-2 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/25'>
						<BsChatDotsFill className='w-4 h-4' />
					</div>
					<div>
						<h1 className='text-base font-bold tracking-tight bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent'>
							ChatApp
						</h1>
					</div>
				</div>

				{/* Quick Action Toolbar */}
				<div className='flex items-center gap-1.5'>
					<ThemeToggle />
					<button
						type='button'
						onClick={() => setIsProfileOpen(true)}
						title='Edit Profile'
						aria-label='Edit Profile'
						className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center
							${
								isDark
									? "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white"
									: "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
							}`}
					>
						<FiEdit3 className='w-4 h-4' />
					</button>
					<LogoutButton />
				</div>
			</div>

			{/* User Profile Card */}
			<div
				onClick={() => setIsProfileOpen(true)}
				className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-200 mb-3 border
					${
						isDark
							? "bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/50 text-white"
							: "bg-white/70 hover:bg-white border-slate-200 text-slate-900 shadow-sm"
					}`}
				title='Click to edit profile'
			>
				<div className='relative shrink-0'>
					<div className='w-10 h-10 rounded-full overflow-hidden border border-slate-700/50 bg-slate-800'>
						<img
							src={authUser?.profilePic}
							alt={authUser?.fullName}
							className='w-full h-full object-cover'
							onError={(e) => handleImageError(e, authUser?.fullName)}
						/>
					</div>
					<span className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900'></span>
				</div>

				<div className='flex flex-col flex-1 min-w-0'>
					<div className='flex items-center justify-between'>
						<p className='text-xs sm:text-sm font-semibold truncate'>{authUser?.fullName}</p>
						<span className='text-[10px] text-indigo-400 font-medium'>You</span>
					</div>
					<p className={`text-[11px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
						{authUser?.bio || authUser?.email || "Available to chat"}
					</p>
				</div>
			</div>

			{/* Search Bar */}
			<div className='mb-2'>
				<SearchInput />
			</div>

			{/* Conversations List */}
			<Conversations />

			{/* Profile Edit Modal */}
			<ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
		</div>
	);
};

export default Sidebar;

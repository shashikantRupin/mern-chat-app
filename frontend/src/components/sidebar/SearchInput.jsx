import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";
import { useThemeContext } from "../../context/ThemeContext";
import toast from "react-hot-toast";

const SearchInput = () => {
	const [search, setSearch] = useState("");
	const { setSelectedConversation } = useConversation();
	const { conversations } = useGetConversations();
	const { isDark } = useThemeContext();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!search.trim()) return;
		if (search.trim().length < 2) {
			return toast.error("Search query must be at least 2 characters");
		}

		const conversation = conversations.find(
			(c) =>
				c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
				c.email?.toLowerCase().includes(search.toLowerCase()) ||
				c.username?.toLowerCase().includes(search.toLowerCase())
		);

		if (conversation) {
			setSelectedConversation(conversation);
			setSearch("");
		} else {
			toast.error("No user found matching '" + search + "'");
		}
	};

	return (
		<form onSubmit={handleSubmit} className='relative w-full'>
			<div className='relative flex items-center'>
				<span className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
					<FiSearch className='w-4 h-4' />
				</span>
				<input
					type='text'
					placeholder='Search chats or email...'
					className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm border transition-all duration-200 outline-none
						${
							isDark
								? "bg-slate-800/60 border-slate-700/70 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500/20"
								: "bg-slate-100/90 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
						}`}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				{search && (
					<button
						type='button'
						onClick={() => setSearch("")}
						className='absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300'
					>
						<FiX className='w-3.5 h-3.5' />
					</button>
				)}
			</div>
		</form>
	);
};

export default SearchInput;

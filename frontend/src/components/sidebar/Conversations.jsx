import useGetConversations from "../../hooks/useGetConversations";
import { getRandomEmoji } from "../../utils/emojis";
import Conversation from "./Conversation";
import { useThemeContext } from "../../context/ThemeContext";
import { FiUsers } from "react-icons/fi";

const Conversations = () => {
	const { loading, conversations } = useGetConversations();
	const { isDark } = useThemeContext();

	return (
		<div className='py-2 flex-1 overflow-y-auto space-y-0.5 pr-1'>
			{conversations.map((conversation, idx) => (
				<Conversation
					key={conversation._id}
					conversation={conversation}
					emoji={getRandomEmoji()}
					lastIdx={idx === conversations.length - 1}
				/>
			))}

			{loading && (
				<div className='flex flex-col items-center justify-center py-12 gap-2 text-slate-400'>
					<span className='loading loading-spinner text-indigo-500 loading-md'></span>
					<span className='text-xs'>Loading contacts...</span>
				</div>
			)}

			{!loading && conversations.length === 0 && (
				<div className='flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400'>
					<div
						className={`p-3 rounded-2xl mb-2 ${isDark ? "bg-slate-800/60" : "bg-slate-100"}`}
					>
						<FiUsers className='w-6 h-6 opacity-60' />
					</div>
					<p className='text-sm font-medium'>No other users found</p>
					<p className='text-xs opacity-70 mt-1'>Invite your friends to start messaging!</p>
				</div>
			)}
		</div>
	);
};

export default Conversations;

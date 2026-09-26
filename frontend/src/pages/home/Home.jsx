import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import useConversation from "../../zustand/useConversation";
import { useThemeContext } from "../../context/ThemeContext";

const Home = () => {
	const { selectedConversation } = useConversation();
	const { isDark } = useThemeContext();

	return (
		<div className='relative w-full max-w-6xl h-[92vh] sm:h-[86vh] flex items-center justify-center'>
			{/* Ambient Glowing Blur Orbs */}
			<div className='absolute -top-12 -left-12 w-64 h-64 bg-violet-600/15 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none'></div>
			<div className='absolute -bottom-12 -right-12 w-64 h-64 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none'></div>

			{/* Main Chat App Glass Shell */}
			<div
				className={`relative z-10 w-full h-full rounded-3xl overflow-hidden border shadow-2xl flex flex-col md:flex-row transition-all duration-300 glass-panel
					${
						isDark
							? "bg-slate-900/80 border-slate-800/80 text-white shadow-indigo-950/20"
							: "bg-white/85 border-slate-200/90 text-slate-900 shadow-slate-300/50"
					}`}
			>
				{/* Sidebar: Visible on desktop, or on mobile when NO conversation is selected */}
				<div
					className={`h-full md:flex ${
						selectedConversation ? "hidden md:flex" : "flex w-full"
					}`}
				>
					<Sidebar />
				</div>

				{/* Chat Canvas: Visible on desktop, or on mobile when a conversation IS selected */}
				<div
					className={`h-full flex-1 flex flex-col min-w-0 ${
						!selectedConversation ? "hidden md:flex" : "flex w-full"
					}`}
				>
					<MessageContainer />
				</div>
			</div>
		</div>
	);
};

export default Home;

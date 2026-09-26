import { useThemeContext } from "../../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = ({ className = "" }) => {
	const { isDark, toggleTheme } = useThemeContext();

	return (
		<button
			type='button'
			onClick={toggleTheme}
			aria-label='Toggle theme'
			title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
			className={`relative p-2 rounded-xl border transition-all duration-300 backdrop-blur-md flex items-center justify-center
				${
					isDark
						? "bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-700/80 hover:text-amber-300 hover:border-amber-400/40 shadow-sm"
						: "bg-white/80 border-slate-200 text-indigo-600 hover:bg-white hover:text-indigo-700 hover:border-indigo-300 shadow-sm"
				} ${className}`}
		>
			{isDark ? (
				<FiSun className='w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45' />
			) : (
				<FiMoon className='w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0' />
			)}
		</button>
	);
};

export default ThemeToggle;

import { FiLogOut } from "react-icons/fi";
import useLogout from "../../hooks/useLogout";
import { useThemeContext } from "../../context/ThemeContext";

const LogoutButton = ({ className = "" }) => {
	const { loading, logout } = useLogout();
	const { isDark } = useThemeContext();

	return (
		<button
			type='button'
			onClick={logout}
			disabled={loading}
			title='Sign Out'
			aria-label='Log out'
			className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center
				${
					isDark
						? "bg-slate-800/80 border-slate-700/80 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-300"
						: "bg-white/80 border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600"
				} ${className}`}
		>
			{!loading ? (
				<FiLogOut className='w-4 h-4' />
			) : (
				<span className='loading loading-spinner loading-xs'></span>
			)}
		</button>
	);
};

export default LogoutButton;

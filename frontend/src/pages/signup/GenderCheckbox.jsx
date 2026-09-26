const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
	return (
		<div className='flex gap-3 my-2'>
			<button
				type='button'
				onClick={() => onCheckboxChange("male")}
				className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200
					${
						selectedGender === "male"
							? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-[1.02]"
							: "bg-slate-800/40 dark:bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 dark:text-slate-300"
					}`}
			>
				<span>👨</span>
				<span>Male</span>
			</button>

			<button
				type='button'
				onClick={() => onCheckboxChange("female")}
				className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200
					${
						selectedGender === "female"
							? "bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-500 shadow-md shadow-pink-500/20 scale-[1.02]"
							: "bg-slate-800/40 dark:bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 dark:text-slate-300"
					}`}
			>
				<span>👩</span>
				<span>Female</span>
			</button>
		</div>
	);
};

export default GenderCheckbox;

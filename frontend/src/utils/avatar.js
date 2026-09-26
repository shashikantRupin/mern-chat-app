export const PRESET_AVATARS = [
	"https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffdfbf",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=d1d4f9",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=ffd5dc",
	"https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=c0aede",
	"https://api.dicebear.com/7.x/personas/svg?seed=Maya&backgroundColor=b6e3f4",
	"https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow&backgroundColor=ffd5dc",
	"https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sparkle&backgroundColor=ffdfbf",
];

export const getFallbackAvatar = (name = "User") => {
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=ffffff&bold=true`;
};

export const handleImageError = (e, name = "User") => {
	e.target.onerror = null;
	e.target.src = getFallbackAvatar(name);
};

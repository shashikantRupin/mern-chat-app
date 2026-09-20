// Backend URL configuration
// In local dev, falls back to http://localhost:5000 if not specified
// In production on Cloudflare Pages, configure VITE_BACKEND_URL in Cloudflare Pages environment variables
export const BACKEND_URL =
	import.meta.env.VITE_BACKEND_URL ||
	(import.meta.env.MODE === "development" ? "http://localhost:5000" : "");

// Helper to get Authorization header from stored user token
export const getAuthHeaders = (extraHeaders = {}) => {
	const user = JSON.parse(localStorage.getItem("chat-user") || "null");
	const headers = { ...extraHeaders };
	if (user?.token) {
		headers["Authorization"] = `Bearer ${user.token}`;
	}
	return headers;
};

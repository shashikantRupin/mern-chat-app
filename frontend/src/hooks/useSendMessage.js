import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { BACKEND_URL, getAuthHeaders } from "../utils/constants";
import { useAuthContext } from "../context/AuthContext";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();
	const { setAuthUser } = useAuthContext();

	const sendMessage = async (message) => {
		setLoading(true);
		try {
			const res = await fetch(`${BACKEND_URL}/api/messages/send/${selectedConversation._id}`, {
				method: "POST",
				headers: getAuthHeaders({
					"Content-Type": "application/json",
				}),
				credentials: "include",
				body: JSON.stringify({ message }),
			});
			const data = await res.json();
			if (res.status === 401 || (data.error && data.error.includes("Unauthorized"))) {
				localStorage.removeItem("chat-user");
				setAuthUser(null);
				throw new Error(data.error || "Session expired. Please log in again.");
			}
			if (data.error) throw new Error(data.error);

			setMessages([...messages, data]);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};
export default useSendMessage;

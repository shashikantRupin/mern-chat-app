import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { BACKEND_URL, getAuthHeaders } from "../utils/constants";
import { useAuthContext } from "../context/AuthContext";

const useGetMessages = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();
	const { setAuthUser } = useAuthContext();

	useEffect(() => {
		const getMessages = async () => {
			setLoading(true);
			try {
				const res = await fetch(`${BACKEND_URL}/api/messages/${selectedConversation._id}`, {
					headers: getAuthHeaders(),
					credentials: "include",
				});
				const data = await res.json();
				if (res.status === 401 || (data.error && data.error.includes("Unauthorized"))) {
					localStorage.removeItem("chat-user");
					setAuthUser(null);
					throw new Error(data.error || "Session expired. Please log in again.");
				}
				if (data.error) throw new Error(data.error);
				setMessages(data);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		if (selectedConversation?._id) getMessages();
	}, [selectedConversation?._id, setMessages, setAuthUser]);

	return { messages, loading };
};
export default useGetMessages;

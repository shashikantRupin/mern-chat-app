import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BACKEND_URL, getAuthHeaders } from "../utils/constants";
import { useAuthContext } from "../context/AuthContext";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);
	const { setAuthUser } = useAuthContext();

	useEffect(() => {
		const getConversations = async () => {
			setLoading(true);
			try {
				const res = await fetch(`${BACKEND_URL}/api/users`, {
					headers: getAuthHeaders(),
					credentials: "include",
				});
				const data = await res.json();
				if (res.status === 401 || (data.error && data.error.includes("Unauthorized"))) {
					localStorage.removeItem("chat-user");
					setAuthUser(null);
					throw new Error(data.error || "Session expired. Please log in again.");
				}
				if (data.error) {
					throw new Error(data.error);
				}
				setConversations(data);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		getConversations();
	}, [setAuthUser]);

	return { loading, conversations };
};
export default useGetConversations;

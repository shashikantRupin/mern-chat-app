import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { BACKEND_URL, getAuthHeaders } from "../utils/constants";

const useLogout = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const logout = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
				method: "POST",
				headers: getAuthHeaders({ "Content-Type": "application/json" }),
				credentials: "include",
			});
			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			localStorage.removeItem("chat-user");
			setAuthUser(null);
			setLoading(false);
		}
	};

	return { loading, logout };
};
export default useLogout;

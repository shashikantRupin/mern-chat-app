import { useState } from "react";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/constants";

const useForgotPassword = () => {
	const [loading, setLoading] = useState(false);

	const sendOtp = async (email) => {
		if (!email) {
			toast.error("Please enter your email address");
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			toast.error("Please enter a valid email address");
			return false;
		}

		setLoading(true);
		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.trim() }),
			});

			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}

			toast.success(data.message || "OTP verification code sent to your email!");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
		if (!email || !otp || !newPassword || !confirmPassword) {
			toast.error("Please fill in all fields");
			return false;
		}

		if (otp.trim().length !== 6) {
			toast.error("OTP must be 6 digits");
			return false;
		}

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return false;
		}

		if (newPassword.length < 6) {
			toast.error("Password must be at least 6 characters");
			return false;
		}

		setLoading(true);
		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim(),
					otp: otp.trim(),
					newPassword,
					confirmPassword,
				}),
			});

			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}

			toast.success(data.message || "Password reset successfully! You can now login.");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { loading, sendOtp, resetPassword };
};

export default useForgotPassword;

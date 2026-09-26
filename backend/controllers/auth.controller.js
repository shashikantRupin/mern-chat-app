import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { sendOtpEmail } from "../utils/emailService.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = async (req, res) => {
	try {
		const { fullName, email, password, confirmPassword, gender } = req.body;

		if (!fullName || !email || !password || !confirmPassword || !gender) {
			return res.status(400).json({ error: "Please fill in all fields" });
		}

		const normalizedEmail = email.toLowerCase().trim();

		if (!emailRegex.test(normalizedEmail)) {
			return res.status(400).json({ error: "Please enter a valid email address" });
		}

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters" });
		}

		const existingUser = await User.findOne({
			$or: [{ email: normalizedEmail }, { username: normalizedEmail }],
		});

		if (existingUser) {
			return res.status(400).json({ error: "Email already exists" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const avatarSeed = encodeURIComponent(fullName.trim());
		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${avatarSeed}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${avatarSeed}`;

		const newUser = new User({
			fullName: fullName.trim(),
			email: normalizedEmail,
			username: normalizedEmail,
			password: hashedPassword,
			gender,
			profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
		});

		if (newUser) {
			// Generate JWT token here
			const token = generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				email: newUser.email,
				profilePic: newUser.profilePic,
				bio: newUser.bio || "🚀 Available to chat",
				token,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Please provide both email and password" });
		}

		const normalizedEmail = email.toLowerCase().trim();

		// Check by email (or username fallback for existing records)
		const user = await User.findOne({
			$or: [{ email: normalizedEmail }, { username: normalizedEmail }],
		});

		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid email or password" });
		}

		if (!user.email) {
			user.email = normalizedEmail;
			await user.save();
		}

		const token = generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email || normalizedEmail,
			profilePic: user.profilePic,
			bio: user.bio || "🚀 Available to chat",
			token,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ error: "Please enter your email address" });
		}

		const normalizedEmail = email.toLowerCase().trim();

		if (!emailRegex.test(normalizedEmail)) {
			return res.status(400).json({ error: "Please enter a valid email address" });
		}

		const user = await User.findOne({
			$or: [{ email: normalizedEmail }, { username: normalizedEmail }],
		});

		if (!user) {
			return res.status(404).json({ error: "No account found with this email address" });
		}

		if (!user.email) {
			user.email = normalizedEmail;
		}

		// Generate 6-digit numeric OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();

		// Hash the OTP before saving to database
		const salt = await bcrypt.genSalt(10);
		user.resetOtp = await bcrypt.hash(otp, salt);
		user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
		await user.save();

		// Send email via Resend
		await sendOtpEmail(user.email || normalizedEmail, otp, user.fullName);

		res.status(200).json({
			message: "Verification OTP code sent to your email successfully",
		});
	} catch (error) {
		console.log("Error in forgotPassword controller", error.message);
		res.status(500).json({ error: error.message || "Failed to send reset code" });
	}
};

export const verifyOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;

		if (!email || !otp) {
			return res.status(400).json({ error: "Please provide both email and OTP" });
		}

		const normalizedEmail = email.toLowerCase().trim();

		const user = await User.findOne({
			$or: [{ email: normalizedEmail }, { username: normalizedEmail }],
		});

		if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
			return res.status(400).json({ error: "Invalid or expired OTP request" });
		}

		if (new Date() > user.resetOtpExpiresAt) {
			return res.status(400).json({ error: "OTP has expired. Please request a new one" });
		}

		const isOtpValid = await bcrypt.compare(otp.trim(), user.resetOtp);
		if (!isOtpValid) {
			return res.status(400).json({ error: "Invalid OTP code" });
		}

		res.status(200).json({ message: "OTP verified successfully" });
	} catch (error) {
		console.log("Error in verifyOtp controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { email, otp, newPassword, confirmPassword } = req.body;

		if (!email || !otp || !newPassword || !confirmPassword) {
			return res.status(400).json({ error: "Please fill in all fields" });
		}

		if (newPassword !== confirmPassword) {
			return res.status(400).json({ error: "Passwords do not match" });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters" });
		}

		const normalizedEmail = email.toLowerCase().trim();

		const user = await User.findOne({
			$or: [{ email: normalizedEmail }, { username: normalizedEmail }],
		});

		if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
			return res.status(400).json({ error: "Invalid or expired reset session. Request a new OTP." });
		}

		if (new Date() > user.resetOtpExpiresAt) {
			return res.status(400).json({ error: "OTP has expired. Please request a new one." });
		}

		const isOtpValid = await bcrypt.compare(otp.trim(), user.resetOtp);
		if (!isOtpValid) {
			return res.status(400).json({ error: "Invalid OTP code" });
		}

		if (!user.email) {
			user.email = normalizedEmail;
		}

		// Hash new password and clear OTP
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		user.resetOtp = null;
		user.resetOtpExpiresAt = null;
		await user.save();

		res.status(200).json({ message: "Password reset successfully. You can now login with your new password." });
	} catch (error) {
		console.log("Error in resetPassword controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		const isProduction =
			process.env.NODE_ENV === "production" ||
			process.env.RENDER === "true" ||
			(process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test");

		res.cookie("jwt", "", {
			maxAge: 0,
			httpOnly: true,
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction,
		});
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};


import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
			"-password -resetOtp -resetOtpExpiresAt"
		);

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const userId = req.user._id;
		const { fullName, profilePic, bio } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (fullName && fullName.trim()) {
			user.fullName = fullName.trim();
		}
		if (profilePic !== undefined) {
			user.profilePic = profilePic;
		}
		if (bio !== undefined) {
			user.bio = bio.trim();
		}

		await user.save();

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email || user.username,
			profilePic: user.profilePic,
			bio: user.bio,
		});
	} catch (error) {
		console.error("Error in updateProfile controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};


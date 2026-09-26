import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			lowercase: true,
			trim: true,
			default: function () {
				return this.username || undefined;
			},
		},
		username: {
			type: String,
			required: false,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		gender: {
			type: String,
			required: true,
			enum: ["male", "female"],
		},
		profilePic: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "🚀 Available to chat",
		},
		resetOtp: {
			type: String,
			default: null,
		},
		resetOtpExpiresAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;


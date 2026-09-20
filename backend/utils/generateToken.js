import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	const isProduction = process.env.NODE_ENV === "production";

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in MS
		httpOnly: true, // prevent XSS attacks
		sameSite: isProduction ? "none" : "lax", // "none" is required for cross-origin requests in production
		secure: isProduction, // secure must be true when sameSite is "none"
	});

	return token;
};

export default generateTokenAndSetCookie;

import { Resend } from "resend";

export const sendOtpEmail = async (toEmail, otp, fullName = "User") => {
	const apiKey = process.env.RESEND_API_KEY;
	const fromEmail = process.env.EMAIL_FROM || "ChatApp <onboarding@resend.dev>";

	const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0f172a;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px;text-align:center;border-bottom:1px solid #334155;background:linear-gradient(180deg,#1e293b 0%,#0f172a 100%);">
              <div style="display:inline-block;padding:12px;background:rgba(56,189,248,0.1);border-radius:12px;margin-bottom:12px;border:1px solid rgba(56,189,248,0.2);">
                <span style="font-size:28px;">💬</span>
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#f8fafc;letter-spacing:-0.5px;">
                Chat<span style="color:#38bdf8;">App</span>
              </h1>
              <p style="margin:6px 0 0 0;font-size:14px;color:#94a3b8;">Password Reset Request</p>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#cbd5e1;">
                Hi <strong style="color:#f8fafc;">${fullName}</strong>,
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:22px;color:#94a3b8;">
                We received a request to reset the password for your ChatApp account. Use the 6-digit verification code below to complete the reset.
              </p>
              
              <!-- OTP Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td align="center" style="background:rgba(15,23,42,0.8);border:2px dashed #38bdf8;border-radius:12px;padding:20px;">
                    <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#38bdf8;margin-bottom:8px;">
                      Verification Code
                    </div>
                    <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#ffffff;text-shadow:0 0 12px rgba(56,189,248,0.4);">
                      ${otp}
                    </div>
                    <div style="font-size:12px;color:#64748b;margin-top:8px;">
                      ⏱️ Valid for 10 minutes only
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:13px;line-height:20px;color:#64748b;">
                ⚠️ If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#0f172a;text-align:center;border-top:1px solid #334155;">
              <p style="margin:0;font-size:12px;color:#64748b;">
                &copy; ${new Date().getFullYear()} ChatApp. Secure Real-Time Messaging.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

	if (!apiKey) {
		console.warn("⚠️ [Resend] RESEND_API_KEY is not set in environment variables.");
		console.log(`🔑 [Dev Fallback] OTP for ${toEmail}: ${otp}`);
		return { success: true, simulated: true, otp };
	}

	try {
		const resend = new Resend(apiKey);
		const { data, error } = await resend.emails.send({
			from: fromEmail,
			to: [toEmail],
			subject: `${otp} is your ChatApp password reset code`,
			html: htmlTemplate,
		});

		if (error) {
			console.error("❌ [Resend] Failed to send OTP email:", error);
			// In case the custom domain isn't verified or rate limited, fallback to logging
			console.log(`🔑 [Fallback] OTP for ${toEmail}: ${otp}`);
			throw new Error(error.message || "Failed to send OTP email");
		}

		console.log("✅ [Resend] OTP email sent successfully:", data?.id);
		return { success: true, data };
	} catch (err) {
		console.error("❌ Error in sendOtpEmail:", err.message);
		throw err;
	}
};

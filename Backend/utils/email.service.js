import nodemailer from 'nodemailer';

export const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || "\"DriveBidRent\" <noreply@drivebidrent.com>",
      to: toEmail,
      subject: "Verify Your DriveBidRent Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">Welcome to DriveBidRent!</h2>
          <p>Thank you for signing up. Please verify your email address to activate your account.</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #1f2937; letter-spacing: 5px; margin: 0; font-size: 36px;">${otpCode}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent successfully:", info.messageId);
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log("Preview URL: %s", testUrl);
    }
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

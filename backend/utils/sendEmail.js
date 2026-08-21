const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (toEmail, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f7f8fa; padding: 32px;">
      <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="background: #33306E; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">KAINOS PORTAL</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #33306E; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">Hello,</p>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Use the OTP below to continue.
            This code will expire in <strong>10 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #f0f0f7; color: #33306E;
                        font-size: 32px; letter-spacing: 8px; font-weight: bold;
                        padding: 16px 32px; border-radius: 8px; border: 2px dashed #33306E;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; font-size: 13px; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email.
            Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} Kainos Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Kainos Portal <noreply@kainoscodeconnectchallenge.co.uk>',
    to: [toEmail],
    subject: 'Your Kainos Portal password reset code',
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
  return data;
};

module.exports = { sendOtpEmail };

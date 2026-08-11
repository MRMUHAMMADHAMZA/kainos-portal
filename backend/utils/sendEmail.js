const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Kainos logo (PNG, base64). Sent as an inline attachment and referenced via cid:
// in the HTML below. Inline attachments render in Gmail/Outlook where data: URIs don't.
const KAINOS_LOGO_BASE64 =
  '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';

const sendOtpEmail = async (toEmail, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f7f8fa; padding: 32px;">
      <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="background: #ffffff; padding: 28px 24px 20px; text-align: center; border-bottom: 3px solid #1B365D;">
          <img src="cid:kainoslogo" alt="Kainos" width="150"
               style="display: inline-block; width: 150px; max-width: 60%; height: auto;">
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1B365D; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">Hello,</p>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Use the OTP below to continue.
            This code will expire in <strong>10 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #f0f4fa; color: #1B365D;
                        font-size: 32px; letter-spacing: 8px; font-weight: bold;
                        padding: 16px 32px; border-radius: 8px; border: 2px dashed #1B365D;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; font-size: 13px; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email.
            Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} Kainos. All rights reserved.
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
    attachments: [
      {
        filename: 'kainos-logo.png',
        content: KAINOS_LOGO_BASE64,
        contentType: 'image/png',
        inlineContentId: 'kainoslogo',
      },
    ],
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
  return data;
};

module.exports = { sendOtpEmail };
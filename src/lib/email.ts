import nodemailer from 'nodemailer';

const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
};

const emailFrom = process.env.EMAIL_FROM;

const transport = nodemailer.createTransport(emailConfig);

if (process.env.NODE_ENV !== 'test') {
  transport.verify().catch(() => 
    console.warn('⚠️ Unable to connect to email server. Make sure you have configured the SMTP options in .env')
  );
}

const sendEmail = async (to: string, subject: string, text: string) => {
  const msg = { from: emailFrom, to, subject, text };
  await transport.sendMail(msg);
};

const sendResetPasswordEmail = async (to: string, token: string, host: string) => {
  const subject = 'Reset Password - ChatApp';
  const resetPasswordUrl = `${host}/api/auth/reset-password?token=${token}`;
  const text = `Dear user,

To reset your password, click on this link: ${resetPasswordUrl}

If you did not request any password resets, then ignore this email.

Best regards,
ChatApp Team`;
  
  await sendEmail(to, subject, text);
};

const sendVerificationEmail = async (to: string, token: string, host: string) => {
  const subject = 'Email Verification - ChatApp';
  const verificationEmailUrl = `${host}/api/auth/verify-email?token=${token}`;
  const text = `Dear user,

To verify your email, click on this link: ${verificationEmailUrl}

If you did not create an account, then ignore this email.

Best regards,
ChatApp Team`;
  
  await sendEmail(to, subject, text);
};

export {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
};

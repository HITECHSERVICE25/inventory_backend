const nodemailer = require('nodemailer');
const  logger  = require('./logger');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email sent', { to: options.email });
  } catch (err) {
    logger.error('Email send error', { error: err.message });
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
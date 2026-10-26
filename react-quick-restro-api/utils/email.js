const nodemailer = require('nodemailer');
const process = require('process');

const config = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
console.log(config);

const sendEmail = async (options) => {
  // 1) CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport(config);

  // 2) DEFINE AN EMAIL OPTIONS
  const mailOptions = {
    from: 'adarsh singh <hello@adarsh.in>',
    to: options.email,
    subject: options.subject,
    message: options.message,
    text: options.message,
    // html: options.html
  };

  // 3) ACTUALL SEND EMAILS
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

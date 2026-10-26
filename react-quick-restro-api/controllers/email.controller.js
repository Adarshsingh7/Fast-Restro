const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: './../config.env' });
const { generateBillPDF } = require('../utils/generateBill');
const {
  forgotPasswordTemplate,
  orderStatusTemplate,
  paymentConfirmationTemplate,
} = require('../utils/emailTemplate');

// 1) Email transporter configuration
const config = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use `true` for port 465
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config);

async function sendEmail(to, type, data) {
  let subject = '';
  let html = '';
  let attachments = [];

  switch (type) {
    case 'forgotPassword':
      subject = 'Reset Your Password - React-Quick-Restro';
      html = forgotPasswordTemplate(data.link);
      break;

    case 'orderStatus':
      subject = `Order Status Updated - React-Quick-Restro`;
      html = orderStatusTemplate(data);

      // If order is completed, generate bill and attach
      if (data.status === 'completed') {
        const pdfBuffer = await generateBillPDF(data.orderData);
        attachments.push({
          filename: `Order-${data.orderData._id}-Bill.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        });
      }
      break;

    case 'paymentConfirmation':
      subject = `Payment Confirmation for Order #${data.orderId}`;
      html = paymentConfirmationTemplate(data);
      break;

    default:
      throw new Error('Invalid email type specified');
  }

  const mailOptions = {
    from: `"Adarsh | React-Quick-Restro" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return { status: 'success', message: 'Email sent successfully' };
  } catch (err) {
    console.error('Failed to send the email', err);
    return {
      status: 'failed',
      message: 'Failed to send the email',
      error: err,
    };
  }
}

module.exports = sendEmail;

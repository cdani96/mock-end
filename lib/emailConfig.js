const pug = require("pug");
const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail({ from, to, subject, verificationCode }) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const pugTemplatePath = "./views/login.pug";
    const compiledFunction = pug.compileFile(pugTemplatePath);
    const emailHtml = compiledFunction({ verificationCode });

    let info = await transporter.sendMail({
      from: `noreply@thedaniweb.eu.org <${from}>`,
      to,
      subject,
      html: emailHtml,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.log("Error occurred: %s", error.message);
    throw error;
  }
}

module.exports = { sendEmail };

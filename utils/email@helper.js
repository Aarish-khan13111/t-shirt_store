const nodemailer = require("nodemailer");

const mailHelper = async (option) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASS,
    },
  });

  const message = {
    from: "arish@mak.dev", // sender address
    to: option.email, // list of receivers
    subject: option.subject, // Subject line
    text: option.message, // plain text body
  };

  await transporter.sendMail(message);
};
module.exports = mailHelper;

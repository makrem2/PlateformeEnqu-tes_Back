require("dotenv").config();
const nodeMail = require("nodemailer");

const sendMail = async (email, mailSubject, content) => {
  try {
    const transporter = await nodeMail.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOption = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: mailSubject,
      html: content,
    };

    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Message Sent Successfully!", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;

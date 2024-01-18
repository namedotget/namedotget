import nodemailer from "nodemailer";

const email = process.env.NODEMAILER_EMAIL;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const mailOptions = {
  from: email,
  to: email,
};

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class ContactService {
  async sendEmail({ name, email, message }) {
    if (!name || !email || !message) {
      throw new Error("All fields are required");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  }
}

export default new ContactService();

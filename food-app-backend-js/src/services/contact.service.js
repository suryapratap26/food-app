import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ContactMessage from "../models/ContactMessage.js";

dotenv.config();

class ContactService {
  hasEmailConfig() {
    return Boolean(
      process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        process.env.RECEIVER_EMAIL
    );
  }

  async sendEmail({ name, email, message }) {
    if (!name || !email || !message) {
      throw new Error("All fields are required");
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      deliveryStatus: "STORED_ONLY",
    });

    if (!this.hasEmailConfig()) {
      return {
        success: true,
        stored: true,
        emailed: false,
        id: contactMessage._id.toString(),
      };
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
    contactMessage.deliveryStatus = "EMAILED";
    await contactMessage.save();

    return {
      success: true,
      stored: true,
      emailed: true,
      id: contactMessage._id.toString(),
    };
  }
}

export default new ContactService();

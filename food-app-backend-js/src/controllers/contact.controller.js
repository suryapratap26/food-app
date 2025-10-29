import contactService from "../services/contact.service.js";

class ContactController {
  async sendContactForm(req, res) {
    try {
      const { name, email, message } = req.body;
      const result = await contactService.sendEmail({ name, email, message });
      res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
      console.error("[CONTACT ERROR]", error.message);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  }
}

export default new ContactController();

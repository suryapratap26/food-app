import contactService from "../services/contact.service.js";

class ContactController {
  async sendContactForm(req, res) {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ success: false, message: "Name, email, and message are required." });
      }

      const result = await contactService.sendEmail({ name, email, message });
      res.status(200).json({
        success: true,
        message: result.emailed
          ? "Message sent successfully!"
          : "Message received successfully!",
      });
    } catch (error) {
      console.error("[CONTACT ERROR]", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send message",
      });
    }
  }
}

export default new ContactController();

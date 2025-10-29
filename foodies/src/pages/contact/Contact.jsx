import React from "react";
import { toast } from "react-toastify";
import { sendContactMessage } from "../../service/userService"; 

const Contact = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: `${e.target.first_name.value} ${e.target.last_name.value}`,
      email: e.target.email.value,
      message: e.target.message.value,
    };

    try {
      await sendContactMessage(formData);
      toast.success("✅ Message sent successfully!");
      e.target.reset();
    } catch (error) {
      console.error("❌ Error sending contact message:", error);
      toast.error("❌ Failed to send message. Try again later.");
    }
  };

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="contact-form p-5 shadow-sm bg-white rounded-4">
              <h2 className="text-center mb-4 fw-bold text-primary">Get in Touch</h2>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="first_name"
                      className="form-control custom-input"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="last_name"
                      className="form-control custom-input"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="email"
                      name="email"
                      className="form-control custom-input"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      name="message"
                      className="form-control custom-input"
                      rows="5"
                      placeholder="Your Message"
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100 py-3 fw-semibold"
                      type="submit"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

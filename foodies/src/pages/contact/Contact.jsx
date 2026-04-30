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
    <section className="py-5 contact-page app-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 mb-4 mb-lg-0">
            <div className="contact-page__aside h-100">
              <div className="contact-page__eyebrow mb-3">Contact KSPK Foods</div>
              <h2 className="fw-bold mb-3">Let’s make your next food experience even better.</h2>
              <p className="mb-4 text-light">
                Questions, feedback, partnership ideas, or support requests. Send us a message and we will get back to you.
              </p>
              <div className="d-grid gap-3">
                <div className="contact-page__point">
                  <div className="fw-semibold mb-1">Fast support</div>
                  <div className="small">Use this form for help with orders, payments, or account issues.</div>
                </div>
                <div className="contact-page__point">
                  <div className="fw-semibold mb-1">Partnership friendly</div>
                  <div className="small">Restaurants and collaborators can reach out directly here too.</div>
                </div>
                <div className="contact-page__point">
                  <div className="fw-semibold mb-1">Stored safely</div>
                  <div className="small">Your contact message is saved even if email delivery is not configured.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="contact-form p-5 shadow-sm bg-white rounded-4">
              <h2 className="text-center mb-4 fw-bold text-primary">Get in Touch</h2>
              <p className="text-center text-muted mb-4">
                Fill in your details and tell us how we can help.
              </p>
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

import { useState } from "react";
import { Mail, Send } from "lucide-react";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div>
      <div>
        <h1>Contact Us</h1>
        <p>Have a question or feedback? We'd love to hear from you!</p>
      </div>

      <div>
        <div>
          <div>
            <h2>Get in Touch</h2>

            <div>
              <div>
                <div>
                  <Mail />
                </div>
                <div>
                  <h3>Email Us</h3>
                  <p>support@recipebook.com</p>
                </div>
              </div>
            </div>

            <div>
              <h3>Frequently Asked Questions</h3>
              <ul>
                <li>• How do I save recipes?</li>
                <li>• Can I share my recipes?</li>
                <li>• How do I edit my profile?</li>
                <li>• What are the posting guidelines?</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div>
            <h2>Send a Message</h2>

            {submitted ? (
              <div>
                <Send />
                <h3>Message Sent!</h3>
                <p>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name">
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    required
                  />
                </div>

                <button
                  type="submit"
                >
                  <Send />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

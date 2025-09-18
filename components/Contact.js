export default function Contact() {
  const scrollToCalendar = (e) => {
    e.preventDefault();
    document.getElementById('calendly-widget').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-content">
        <div className="contact-header">
          <h2>Get In Touch</h2>
          <p className="contact-subtitle">
            Ready to transform your business with AI? Let's discuss your project and explore how our solutions can drive your success.
          </p>
        </div>
        
        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <h3>Email Us</h3>
            <p>Send us a detailed message about your project</p>
            <a href="mailto:contact@brightmindvision.com" className="contact-link email-link">
              <span className="link-text">contact@brightmindvision.com</span>
            </a>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>Call Us</h3>
            <p>Speak directly with our AI experts</p>
            <a href="tel:+919554024428" className="contact-link phone-link">
              <span className="link-text">+91 95540 24428</span>
            </a>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">📅</div>
            <h3>Schedule Meeting</h3>
            <p>Book a free consultation with our AI experts</p>
            <a href="#" className="contact-link schedule-link" onClick={scrollToCalendar}>
              <span className="link-text">Book Free Consultation</span>
            </a>
          </div>
        </div>
        
        {/* Centered Schedule Section */}
        <div className="schedule-section">
            <div className="contact-card">
                <div className="contact-icon">💬</div>
                <h3>WhatsApp Chat</h3>
                <p>Start a conversation about your AI needs</p>
                <a href="https://wa.me/919554024428?text=Hi%20Bright%20Mind%20Vision,%20I%27m%20interested%20in%20your%20AI%20services" target="_blank" rel="noopener noreferrer" className="contact-link whatsapp-link">
                    <span className="link-text">Chat on WhatsApp</span>
                </a>
            </div>
        </div>
      </div>
    </section>
  );
}

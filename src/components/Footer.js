import React from 'react';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">🏀 INTER-NMIMS BASKETBALL 2025</h3>
          <p className="footer-description">
            The ultimate inter-collegiate basketball tournament hosted at NMIMS Hyderabad Campus.
            Experience the thrill, passion, and sportsmanship!
          </p>
          <div className="social-links">
            <a href="https://instagram.com/nmims" target="_blank" rel="noopener noreferrer" className="social-link">
              <Instagram size={20} />
            </a>
            <a href="mailto:sports@nmims.edu" className="social-link">
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/getting-here">Getting Here</a></li>
            <li><a href="/schedule">Match Schedule</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact Info</h4>
          <div className="contact-info">
            <div className="contact-item">
              <MapPin size={18} />
              <span>NMIMS Jadcherla Campus, Mahbubnagar, Telangana</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>+91 8411031657</span>
            </div>
            <div className="contact-item">
              <Mail size={18} />
              <span>sunny.saini@nmims.edu</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Event Date</h4>
          <p className="event-date">November 4-5, 2025</p>
          <p className="event-location">NMIMS Jadcherla Campus</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; Kevindeep Singh Pannu (STME) 2025. All rights reserved.</p>
        <p>Made with ❤️ for basketball enthusiasts</p>
      </div>
    </footer>
  );
};

export default Footer;

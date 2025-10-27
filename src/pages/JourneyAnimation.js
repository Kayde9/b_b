import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, PlayCircle, Video, Navigation } from 'lucide-react';
import './JourneyAnimation.css';

const JourneyAnimation = () => {
  return (
    <div className="journey-animation page-container">
      {/* Hero Section */}
      <section className="animation-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-icon">
            <Video size={60} strokeWidth={2} />
          </div>
          <h1 className="section-title">
            YOUR JOURNEY TO NMIMS
          </h1>
          <p className="section-subtitle">
            Navigate your route from Rajiv Gandhi International Airport to NMIMS Hyderabad Campus
          </p>
          <div className="hero-badges">
            <span className="badge">🗺️ Interactive Map</span>
            <span className="badge">📍 Turn-by-Turn Directions</span>
            <span className="badge">🚗 ~130 km Journey</span>
          </div>
        </motion.div>
      </section>

      {/* Map Section */}
      <section className="animation-section section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="animation-wrapper"
        >
          <div className="map-container glass-card">
            <h3 className="map-title">
              <Navigation size={24} />
              Route from Airport to NMIMS Hyderabad
            </h3>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d463939.05208403163!2d77.97953651065447!3d17.111853645862723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sRajiv%20Gandhi%20International%20Airport%2C%20Hyderabad%2C%20Telangana!3m2!1d17.2403209!2d78.4294374!4m5!1s0x3bca3174f92e7b17%3A0x55f32ff33b967591!2sSVKM&#39;s%20NMIMS%20Hyderabad%2C%20Green%20Industrial%20Park%2C%20SEZ%2C%20TSIIC%2C%20Polepalle%2C%20Jadcherla%2C%20Telangana!3m2!1d16.8251839!2d78.1424809!5e0!3m2!1sen!2sin!4v1729766400000!5m2!1sen!2sin" 
              width="100%" 
              height="600" 
              style={{ border: 0, borderRadius: '1rem' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Route from Airport to NMIMS Hyderabad"
            />
            <div className="route-info">
              <p><strong>Distance:</strong> ~130 km</p>
              <p><strong>Duration:</strong> ~2.5 hours</p>
              <p><strong>Route:</strong> Via NH-44 and NH-765</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <h2 className="section-title">MAP FEATURES</h2>
        <div className="features-grid">
          <motion.div
            className="feature-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="feature-icon">🗺️</div>
            <h3>Interactive Route</h3>
            <p>View the complete route from airport to campus with turn-by-turn directions</p>
          </motion.div>

          <motion.div
            className="feature-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="feature-icon">📍</div>
            <h3>Live Traffic Updates</h3>
            <p>Google Maps integration provides real-time traffic conditions and alternate routes</p>
          </motion.div>

          <motion.div
            className="feature-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="feature-icon">🚗</div>
            <h3>Multiple Transport Options</h3>
            <p>View routes for driving, public transit, or ride-sharing services</p>
          </motion.div>

          <motion.div
            className="feature-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="feature-icon">⏱️</div>
            <h3>Accurate Time Estimates</h3>
            <p>Get precise travel time estimates based on current traffic conditions</p>
          </motion.div>

          <motion.div
            className="feature-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="feature-icon">🛰️</div>
            <h3>Satellite View</h3>
            <p>Switch to satellite imagery to see the actual terrain and landmarks along the route</p>
          </motion.div>

          <motion.div
            className="feature-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="feature-icon">📱</div>
            <h3>Mobile Navigation</h3>
            <p>Open directly in Google Maps app for turn-by-turn navigation on your device</p>
          </motion.div>
        </div>
      </section>

      {/* Journey Info */}
      <section className="journey-info-section section">
        <motion.div
          className="info-card glass-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="info-header">
            <MapPin size={40} className="info-icon" />
            <h2>Journey Details</h2>
          </div>
          <div className="info-content">
            <div className="info-row">
              <span className="info-label">Starting Point:</span>
              <span className="info-value">Rajiv Gandhi International Airport, Shamshabad, Hyderabad</span>
            </div>
            <div className="info-row">
              <span className="info-label">Destination:</span>
              <span className="info-value">NMIMS Hyderabad Campus, Plot No. B4, Green Industrial Park, Polepally SEZ, Jadcherla, Mahbubnagar, Telangana 509301</span>
            </div>
            <div className="info-row">
              <span className="info-label">Distance:</span>
              <span className="info-value">~68 km</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estimated Travel Time:</span>
              <span className="info-value">59 minutes</span>
            </div>
            <div className="info-row">
              <span className="info-label">Main Route:</span>
              <span className="info-value">NH 44 via Jadcherla</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <motion.div
          className="cta-card glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="basketball-icon-large">🏀</div>
          <h2>Ready to Join the Tournament?</h2>
          <p>
            Experience the thrill of Inter-NMIMS Basketball Tournament 2025 at our state-of-the-art campus in Hyderabad
          </p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary">
              <PlayCircle size={20} />
              Register Now
            </a>
            <a href="/getting-here" className="btn btn-secondary">
              <MapPin size={20} />
              View All Routes
            </a>
            <a 
              href="https://www.google.com/maps?q=16.825368735895818,78.14250235351602&hl=en&t=m&z=15"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent"
            >
              <MapPin size={20} />
              Open in Google Maps
            </a>
            <a 
              href="https://www.uber.com/global/en/cities/hyderabad/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              🚗 Book a Cab
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default JourneyAnimation;

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import './GettingHere.css';

const GettingHere = () => {

  return (
    <div className="getting-here page-container">
      {/* Combined Section - Title, Map, and Address */}
      <section className="compact-map-section section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="compact-content"
        >
          <h1 className="section-title">
            <MapPin className="title-icon" />
            GETTING TO NMIMS HYDERABAD
          </h1>
          <p className="section-subtitle">
            Navigate your way to the tournament at Jadcherla Campus
          </p>

          {/* Google Maps */}
          <motion.div
            className="google-map-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d463939.05208403163!2d77.97953651065447!3d17.111853645862723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!3m2!1d17.406498!2d78.47724389999999!4m5!1s0x3bca3174f92e7b17%3A0x55f32ff33b967591!2sSVKM&#39;s%20NMIMS%20deemed%20to%20be%20university%20Hyderabad%2C%20Green%20Industrial%20Park%2C%20SEZ%2C%20TSIIC%2C%20Polepalle%2C%20Jadcherla%2C%20Telangana!3m2!1d16.8251839!2d78.1424809!5e1!3m2!1sen!2sin!4v1760561350400!5m2!1sen!2sin" 
              width="100%" 
              height="500" 
              style={{ border: 0, borderRadius: '1rem' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="NMIMS Hyderabad Campus Location"
            />
          </motion.div>

          {/* Campus Address */}
          <motion.div
            className="address-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="address-title">
              <MapPin size={30} />
              NMIMS Hyderabad Campus
            </h3>
            <p className="address-text">
              SVKM's NMIMS Deemed to be University Hyderabad<br />
              Green Industrial Park, SEZ, TSIIC<br />
              Polepalle, Jadcherla, Telangana
            </p>
            <a
              href="https://www.google.com/maps/place/16.8251839,78.1424809"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary map-link-button"
            >
              <ExternalLink size={20} />
              Open in Google Maps
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default GettingHere;

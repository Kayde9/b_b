import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trophy, Users } from 'lucide-react';
import LazyBasketball3D from '../components/LazyBasketball3D';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <Calendar size={40} />,
      title: 'November 4-5, 2025',
      description: 'Boys & Girls knockout tournament - the ultimate basketball showdown'
    },
    {
      icon: <MapPin size={40} />,
      title: 'NMIMS Jadcherla',
      description: 'State-of-the-art basketball facilities at Hyderabad Campus'
    },
    {
      icon: <Trophy size={40} />,
      title: 'Championship Glory',
      description: 'Compete for the Inter-NMIMS title'
    },
    
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="basketball-3d-hero">
            <LazyBasketball3D />
          </div>
        </div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <motion.span
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              🏀 OFFICIAL TOURNAMENT WEBSITE
            </motion.span>
            
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              INTER-NMIMS<br />
              BASKETBALL<br />
              TOURNAMENT 2025
            </motion.h1>
            
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Experience the ultimate showdown of skill, teamwork, and passion
              at NMIMS Jadcherla Campus, Hyderabad
            </motion.p>
            
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link to="/scoreboard" className="btn btn-primary">
                <Trophy size={20} />
                View Live Match
              </Link>
              <Link to="/schedule" className="btn btn-secondary">
                <Calendar size={20} />
                Match Schedule
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="scroll-indicator">
          <div className="mouse"></div>
          <p>Scroll to explore</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">TOURNAMENT HIGHLIGHTS</h2>
          <p className="section-subtitle">
            Everything you need to know about the event
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about section">
        <div className="about-content">
          <motion.div
            className="about-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">ABOUT THE TOURNAMENT</h2>
            <p className="about-description">
              The Inter-NMIMS Basketball Tournament 2025 brings together the finest basketball 
              talent from NMIMS campuses across India. Hosted at the state-of-the-art facilities 
              of NMIMS Hyderabad Campus, this tournament promises intense competition, 
              unforgettable moments, and the true spirit of sportsmanship.
            </p>
            <p className="about-description">
              Whether you're a participant, supporter, or basketball enthusiast, join us for 
              three days of high-energy action, team spirit, and championship glory. This is 
              more than just a tournament – it's a celebration of excellence, dedication, and 
              the love of the game.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <h3 className="stat-number">7</h3>
                <p className="stat-label">Participating Teams</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-number">2</h3>
                <p className="stat-label">Days of Action</p>
              </div>
            
            </div>
          </motion.div>

          <motion.div
            className="about-visual"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="visual-card glass-card">
              <div className="visual-basketball">
                <LazyBasketball3D />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="cta-title">READY TO WITNESS THE ACTION?</h2>
          <p className="cta-description">
            Get all the details you need to be part of this incredible event
          </p>
          <div className="cta-buttons">
            <Link to="/getting-here" className="btn btn-secondary">
              Plan Your Visit
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;

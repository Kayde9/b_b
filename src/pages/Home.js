import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trophy, Users } from 'lucide-react';
import LazyBasketball3D from '../components/LazyBasketball3D';
import './Home.css';

const Home = () => {
  const tournamentHighlights = [
    { title: 'Practice Sessions', emoji: '🏃', description: 'Teams warming up' },
    { title: 'Opening Ceremony', emoji: '🎉', description: 'Grand opening' },
    { title: 'Jersey Reveal', emoji: '👕', description: 'Team uniforms' },
    { title: 'Trophy Reveal', emoji: '🏆', description: 'Championship prize' },
    { title: 'Three Pointers', emoji: '🎯', description: 'Long range shots' },
    { title: 'Fast Breaks', emoji: '⚡', description: 'Lightning attacks' },
    { title: 'Rebounder Action', emoji: '🔄', description: 'Board control' },
    { title: 'Closing Ceremony', emoji: '🎊', description: 'Victory celebration' }
  ];

  const participatingTeams = [
    { id: 1, name: 'NMIMS Hyderabad' },
    { id: 2, name: 'NMIMS Mumbai' },
    { id: 3, name: 'NMIMS Navi-Mumbai' },
    { id: 4, name: 'NMIMS Indore' },
    { id: 5, name: 'NMIMS Shirpur' },
    { id: 6, name: 'NMIMS Chandigarh' },
    { id: 7, name: 'NMIMS Bengaluru' }
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

      {/* Tournament Highlights - Polaroid Gallery */}
      <section className="highlights-gallery section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">TOURNAMENT HIGHLIGHTS</h2>
          <p className="section-subtitle">
            Moments that make the tournament unforgettable
          </p>
        </motion.div>

        <div className="polaroid-grid">
          {tournamentHighlights.map((highlight, index) => (
            <motion.div
              key={index}
              className="polaroid-card"
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: Math.random() * 6 - 3 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            >
              <div className="polaroid-photo">
                <div className="photo-placeholder">
                  <span className="photo-emoji">{highlight.emoji}</span>
                </div>
              </div>
              <div className="polaroid-caption">
                <h3 className="highlight-title">{highlight.title}</h3>
                <p className="highlight-desc">{highlight.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Participating Teams Section */}
      <section className="teams-section section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">PARTICIPATING TEAMS</h2>
          <p className="section-subtitle">
            Meet the champions competing in the tournament
          </p>
        </motion.div>

        <div className="teams-carousel-container">
          <div className="teams-carousel">
            {[...participatingTeams, ...participatingTeams].map((team, index) => (
              <motion.div
                key={`${team.id}-${index}`}
                className="team-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="team-logo-circle">
                  <span className="team-icon">🏀</span>
                </div>
                <h3 className="team-name">{team.name}</h3>
              </motion.div>
            ))}
          </div>
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

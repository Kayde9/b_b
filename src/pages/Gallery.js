import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Instagram, X } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [imagesLoading, setImagesLoading] = useState(true);
  
  // Simulate loading images
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeFilter]);

  // Placeholder gallery items - replace with actual images
  const galleryItems = [
    { id: 1, type: 'action', title: 'Championship Dunk', description: 'Intense moment from the finals' },
    { id: 2, type: 'team', title: 'Team NMIMS Mumbai', description: 'Pre-game huddle' },
    { id: 3, type: 'action', title: 'Three Pointer', description: 'Game-winning shot' },
    { id: 4, type: 'ceremony', title: 'Opening Ceremony', description: 'Tournament kickoff' },
    { id: 5, type: 'action', title: 'Defense Play', description: 'Blocking the shot' },
    { id: 6, type: 'team', title: 'Team NMIMS Hyderabad', description: 'Home team ready' },
    { id: 7, type: 'ceremony', title: 'Trophy Presentation', description: 'Champions crowned' },
    { id: 8, type: 'action', title: 'Fast Break', description: 'Speed and agility' },
    { id: 9, type: 'team', title: 'Team NMIMS Bangalore', description: 'Team spirit' },
    { id: 10, type: 'action', title: 'Slam Dunk Contest', description: 'Crowd favorite' },
    { id: 11, type: 'ceremony', title: 'Award Ceremony', description: 'MVP announcement' },
    { id: 12, type: 'action', title: 'Buzzer Beater', description: 'Last second victory' }
  ];

  const filters = [
    { id: 'all', label: 'All Photos', count: galleryItems.length },
    { id: 'action', label: 'Action Shots', count: galleryItems.filter(i => i.type === 'action').length },
    { id: 'team', label: 'Team Photos', count: galleryItems.filter(i => i.type === 'team').length },
    { id: 'ceremony', label: 'Ceremonies', count: galleryItems.filter(i => i.type === 'ceremony').length }
  ];

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.type === activeFilter);

  return (
    <div className="gallery page-container">
      <section className="gallery-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="section-title">
            <Image className="title-icon" />
            TOURNAMENT GALLERY
          </h1>
          <p className="section-subtitle">
            Relive the best moments from the tournament
          </p>
        </motion.div>
      </section>

      {/* Instagram CTA */}
      <section className="instagram-section section">
        <motion.div
          className="instagram-card glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="instagram-content">
            <Instagram size={50} color="#F97316" />
            <h3 className="instagram-title">Follow Us on Instagram</h3>
            <p className="instagram-description">
              Get live updates, behind-the-scenes content, and exclusive photos from the tournament
            </p>
            <a
              href="https://instagram.com/nmims"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Instagram size={20} />
              @nmims_official
            </a>
          </div>
        </motion.div>
      </section>

      {/* Gallery Filters */}
      <section className="gallery-section section">
        <div className="gallery-filters">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
              <span className="filter-count">{filter.count}</span>
            </motion.button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div className="gallery-grid" layout>
          {imagesLoading ? (
            <div className="loading-container glass-card">
              <p>Loading gallery...</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="gallery-item"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedImage(item)}
              >
                <div className="gallery-image-placeholder">
                  <div className="image-icon">🏀</div>
                  <div className="image-overlay">
                    <h4 className="image-title">{item.title}</h4>
                    <p className="image-description">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </motion.div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="image-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedImage(null)}>
                <X size={24} />
              </button>
              <div className="modal-image-placeholder">
                <div className="modal-icon">🏀</div>
              </div>
              <div className="modal-info">
                <h3 className="modal-title">{selectedImage.title}</h3>
                <p className="modal-description">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Section */}
      <section className="video-section section">
        <h2 className="section-title">TOURNAMENT HIGHLIGHTS</h2>
        <p className="section-subtitle">
          Watch the most exciting moments from the tournament
        </p>
        <motion.div
          className="video-grid"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="video-card glass-card">
            <div className="video-placeholder">
              <div className="play-button">▶</div>
              <p>Tournament Highlights Reel</p>
            </div>
          </div>
          <div className="video-card glass-card">
            <div className="video-placeholder">
              <div className="play-button">▶</div>
              <p>Best Plays Compilation</p>
            </div>
          </div>
          <div className="video-card glass-card">
            <div className="video-placeholder">
              <div className="play-button">▶</div>
              <p>Championship Final</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Gallery;

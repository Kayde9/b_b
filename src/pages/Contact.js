import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, User, Send, Building, Users } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    teamName: '',
    captainEmail: '',
    captainPhone: '',
    teamCampus: '',
    players: Array(10).fill(null).map(() => ({
      name: '',
      jersey: '',
      campus: '',
      sapId: '',
      contact: ''
    }))
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic here
    console.log('Team Registration:', formData);
    alert('Thank you for registering! We will get back to you soon.');
    // Reset form
    setFormData({
      teamName: '',
      captainEmail: '',
      captainPhone: '',
      teamCampus: '',
      players: Array(10).fill(null).map(() => ({
        name: '',
        jersey: '',
        campus: '',
        sapId: '',
        contact: ''
      }))
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...formData.players];
    updatedPlayers[index][field] = value;
    setFormData({
      ...formData,
      players: updatedPlayers
    });
  };

  const organizers = [
    {
      role: 'Sports Director',
      name: 'Mr. Kiran Anchan',
      email: 'kiran.anchan@svkm.ac.in',
      phone: '+91 9022899933'
    },
    {
      role: 'Campus Director',
      name: 'Dr. Suman Naredla',
      email: 'suman.naredla@nmims.edu',
      phone: ''
    },
    {
      role: 'Assistant Sports Officer',
      name: 'Mr. Sunny Saini',
      email: 'sunny.saini@nmims.edu',
      phone: '+91 8411031657'
    }
  ];

  const accommodations = [
    {
      name: 'Hotel Meridian',
      distance: '2.5 km from campus',
      price: '₹3,500 - ₹5,000 per night',
      rating: '4.5★',
      amenities: ['Free WiFi', 'Breakfast', 'Gym', 'Pool']
    },
    {
      name: 'Comfort Inn Hyderabad',
      distance: '3.0 km from campus',
      price: '₹2,500 - ₹4,000 per night',
      rating: '4.0★',
      amenities: ['Free WiFi', 'Breakfast', 'Parking', 'AC']
    },
    {
      name: 'Budget Stay',
      distance: '1.5 km from campus',
      price: '₹1,500 - ₹2,500 per night',
      rating: '3.5★',
      amenities: ['WiFi', 'Basic Breakfast', 'Clean Rooms']
    }
  ];

  return (
    <div className="contact page-container">
      {/* Organizers */}
      <section className="organizers-section section" style={{ paddingTop: '2rem' }}>
        <h2 className="section-title">ORGANIZING COMMITTEE</h2>
        <p className="section-subtitle">
          Get in touch with our team for any queries
        </p>

        <div className="organizers-grid">
          {organizers.map((organizer, index) => (
            <motion.div
              key={index}
              className="organizer-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="organizer-icon">
                <User size={40} />
              </div>
              <h3 className="organizer-role">{organizer.role}</h3>
              <h4 className="organizer-name">{organizer.name}</h4>
              <div className="organizer-details">
                <a href={`mailto:${organizer.email}`} className="detail-link">
                  <Mail size={16} />
                  {organizer.email}
                </a>
                {organizer.phone && (
                  <a href={`tel:${organizer.phone}`} className="detail-link">
                    <Phone size={16} />
                    {organizer.phone}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Campus Address */}
      <section className="address-final-section section">
        <motion.div
          className="final-address-card glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <MapPin size={50} color="#F97316" />
          <h3 className="final-address-title">NMIMS Hyderabad Campus</h3>
          <p className="final-address-text">
            Plot No. B4, Green Industrial Park,<br />
            Polepally SEZ, TSIIC, Jadcherla,<br />
            Mahbubnagar, Telangana 509 301
          </p>
          <div className="final-contact-details">
            <a href="mailto:sunny.saini@nmims.edu" className="final-contact-link">
              <Mail size={20} />
              sunny.saini@nmims.edu
            </a>
            <a href="tel:+918411031657" className="final-contact-link">
              <Phone size={20} />
              +91 8411031657
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;

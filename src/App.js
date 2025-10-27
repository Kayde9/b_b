import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import GettingHere from './pages/GettingHere';
import JourneyAnimation from './pages/JourneyAnimation';
import Schedule from './pages/Schedule';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminScoring from './pages/AdminScoring';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Admin route without navbar/footer */}
        <Route path="/admin-scoring" element={<AdminScoring />} />
        
        {/* Regular routes with navbar/footer */}
        <Route path="/" element={
          <div className="App">
            <Navbar />
            <Home />
            <Footer />
          </div>
        } />
        <Route path="/getting-here" element={
          <div className="App">
            <Navbar />
            <GettingHere />
            <Footer />
          </div>
        } />
        <Route path="/journey-animation" element={
          <div className="App">
            <Navbar />
            <JourneyAnimation />
            <Footer />
          </div>
        } />
        <Route path="/schedule" element={
          <div className="App">
            <Navbar />
            <Schedule />
            <Footer />
          </div>
        } />
        <Route path="/gallery" element={
          <div className="App">
            <Navbar />
            <Gallery />
            <Footer />
          </div>
        } />
        <Route path="/contact" element={
          <div className="App">
            <Navbar />
            <Contact />
            <Footer />
          </div>
        } />
        
        {/* 404 Catch-all route */}
        <Route path="*" element={
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d1810 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div>
              <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Page Not Found</p>
              <a 
                href="/" 
                style={{
                  padding: '1rem 2rem',
                  background: '#FF6B35',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Styles/HomePage.css';

const HomePage = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>MediConnect</h1>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>

          <button className="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? "✕" : "☰"}
          </button>

          <nav className={`main-nav ${isMenuOpen ? 'show' : ''}`}>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup/patient" className="nav-link">Patient Signup</Link>
            <Link to="/signup/doctor" className="nav-link">Doctor Signup</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Your Health, Our Priority</h1>
          <p>Connect with top healthcare professionals and manage your appointments with ease</p>
          <div className="hero-buttons">
            <Link to="/login" className="primary-button">Get Started</Link>
            <Link to="/signup/patient" className="secondary-button">Register as Patient</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose MediConnect?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Expert Doctors</h3>
            <p>Access to verified and experienced healthcare professionals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Scheduling</h3>
            <p>Book and manage appointments with just a few clicks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock assistance for all your healthcare needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Digital Records</h3>
            <p>Secure access to your medical history and prescriptions</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>5,000+</h3>
            <p>Registered Patients</p>
          </div>
          <div className="stat-card">
            <h3>100+</h3>
            <p>Expert Doctors</p>
          </div>
          <div className="stat-card">
            <h3>4,000+</h3>
            <p>Appointments</p>
          </div>
          <div className="stat-card">
            <h3>95%</h3>
            <p>Patient Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"Excellent platform for managing healthcare appointments. Very user-friendly!"</p>
            <div className="testimonial-author">- Sarah Johnson</div>
          </div>
          <div className="testimonial-card">
            <p>"As a doctor, this platform helps me manage my schedule efficiently."</p>
            <div className="testimonial-author">- Dr. Utpal Kant</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>MediConnect</h3>
            <p>Your trusted healthcare companion</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/careers">Careers</Link>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p> © 2025 MediConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
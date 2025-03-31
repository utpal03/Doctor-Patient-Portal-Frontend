"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../../Styles/HomePage.css"

const HomePage = () => {
  const [theme] = useState("dark")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    document.body.className = "dark"
  }, [])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      text: "MediConnect has transformed how I manage my healthcare. The appointment scheduling is seamless, and I love having all my medical records in one place!",
      author: "Sarah Johnson",
      role: "Patient",
    },
    {
      text: "As a doctor, this platform helps me manage my schedule efficiently. The interface is intuitive, and patient communication has never been easier.",
      author: "Dr. Utpal Kant",
      role: "Cardiologist",
    },
    {
      text: "I've tried several healthcare platforms, but MediConnect stands out with its user-friendly design and responsive support team.",
      author: "Michael Chen",
      role: "Patient",
    },
  ]

  const features = [
    {
      icon: "👨‍⚕️",
      title: "Expert Doctors",
      description: "Access to verified and experienced healthcare professionals across multiple specialties.",
    },
    {
      icon: "📅",
      title: "Easy Scheduling",
      description: "Book and manage appointments with just a few clicks, receive reminders and updates.",
    },
    {
      icon: "⏰",
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your healthcare needs, whenever you need it.",
    },
    {
      icon: "📱",
      title: "Digital Records",
      description: "Secure access to your medical history, prescriptions, and test results in one place.",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Create an Account",
      description: "Sign up as a patient or doctor with a simple registration process.",
    },
    {
      number: "02",
      title: "Find Your Doctor",
      description: "Browse through our network of qualified healthcare professionals.",
    },
    {
      number: "03",
      title: "Book Appointment",
      description: "Select a convenient time slot and book your appointment instantly.",
    },
    {
      number: "04",
      title: "Get Care",
      description: "Receive quality healthcare and manage your medical records digitally.",
    },
  ]

  return (
    <div className={`home-container ${isVisible ? "visible" : ""} dark`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon">💊</span>
              <h1>MediConnect</h1>
            </div>
          </div>

          <button
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? "active" : ""}`}></span>
          </button>

          <nav className={`main-nav ${isMenuOpen ? "show" : ""}`}>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup/patient" className="nav-link">
              Patient Signup
            </Link>
            <Link to="/signup/doctor" className="nav-link">
              Doctor Signup
            </Link>
            <Link to="/about" className="nav-link">
              About Us
            </Link>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Your Health, Our Priority</h1>
            <p className="hero-subtitle">
              Connect with top healthcare professionals and manage your appointments with ease
            </p>
            <div className="hero-buttons">
              <button
                onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}
                className="primary-button"
              >
                Get Started
              </button>
              <Link to="/signup/patient" className="secondary-button">
                Register as Patient
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <img
                src="https://placehold.co/600x400/4a90e2/ffffff?text=Mediconnect"
                alt="Healthcare professionals"
              />
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose MediConnect?</h2>
          <p>Our platform offers a comprehensive solution for all your healthcare needs</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to get started with MediConnect</p>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div className="step-card" key={index}>
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="section-header">
          <h2>Our Impact</h2>
          <p>Growing stronger with every patient and doctor who joins us</p>
        </div>
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
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Real experiences from patients and doctors</p>
        </div>
        <div className="testimonials-carousel">
          {testimonials.map((testimonial, index) => (
            <div
              className={`testimonial-card ${index === activeTestimonial ? "active" : ""}`}
              key={index}
            >
              <div className="quote-icon">"</div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-name">- {testimonial.author}</div>
                <div className="author-role">{testimonial.role}</div>
              </div>
            </div>
          ))}
          <div className="carousel-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === activeTestimonial ? "active" : ""}`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Testimonial ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest health tips and updates</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" required />
            <button type="submit" className="primary-button">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <span className="logo-icon">💊</span>
              <h3>MediConnect</h3>
            </div>
            <p>Your trusted healthcare companion</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i className="social-icon">📘</i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="social-icon">📘</i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="social-icon">📘</i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="social-icon">📘</i>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/faq">FAQ</Link>
            </div>
            <div className="footer-section">
              <h4>For Patients</h4>
              <Link to="/find-doctor">Find a Doctor</Link>
              <Link to="/appointments">Appointments</Link>
              <Link to="/medical-records">Medical Records</Link>
            </div>
            <div className="footer-section">
              <h4>For Doctors</h4>
              <Link to="/join-network">Join Our Network</Link>
              <Link to="/doctor-resources">Resources</Link>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 MediConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

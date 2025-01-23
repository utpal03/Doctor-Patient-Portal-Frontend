import React, { useState } from "react";
import { forgotPassword } from "../Utils/api";
import "../../Styles/ForgotPassword.css";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="card-content success-content">
            <div className="success-icon">✉️</div>
            <h2>Check your email</h2>
            <p className="description">
              We've sent password reset instructions to {email}
            </p>
            <button
              className="button button-secondary"
              onClick={() => setSuccess(false)}
            >
              Send new reset link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="card-header">
          {/* <button 
            className="back-button"
            onClick={handleBackToLogin}
          >
            ←
          </button> */}
          <div>
            <h2>Forgot Password</h2>
            <p className="description">
              Enter your email address and we'll send you a reset link
            </p>
          </div>
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit} className="form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={isLoading}
            >
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <div className="card-footer">
            <div className="auth-links">
              <p>
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

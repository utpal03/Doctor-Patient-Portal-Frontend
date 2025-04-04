import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../Utils/api";
import { storeTokens } from "../Utils/tokenService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loginType, setLoginType] = useState("doctor");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    
    if (token) {
      if (roles.includes("DOCTOR")) {
        navigate("/doctor/dashboard");
      } else if (roles.includes("PATIENT")) {
        navigate("/patient/dashboard");
      }
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login(formData, loginType);
      // Store tokens,roles and ID
      storeTokens(response.accessToken, response.refreshToken);
      localStorage.setItem("roles", JSON.stringify(response.roles));
      localStorage.setItem("id", response.id);
      
      const roles = response.roles;
      if (roles.includes("DOCTOR")) {
        navigate("/doctor/dashboard");
      } else if (roles.includes("PATIENT")) {
        navigate("/patient/dashboard");
      }
    } catch (err) {
      setErrors({
        submit: err.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className={errors.username ? "error" : ""}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Login"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <div className="auth-separator">
            <span>OR</span>
          </div>
          <p>
            Don't have an account? <br />
            <Link to="/signup/patient">Sign up as Patient</Link> or{" "}
            <Link to="/signup/doctor">Sign up as Doctor</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
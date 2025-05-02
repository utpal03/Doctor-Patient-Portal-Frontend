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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await login(formData); // No loginType needed
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
      const status = err?.response?.status;
      const message =
        status === 401
          ? "Invalid username or password."
          : status === 400
          ? err?.response?.data?.message || "Bad request. Please check your input."
          : err?.response?.data?.message || "Login failed. Please try again.";
  
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
      setFormData((prev) => ({ ...prev, password: "" }));
    }
  };
  

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          {/* Username Field */}
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
              aria-label="Username"
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          {/* Password Field with Toggle */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={errors.password ? "error" : ""}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          {/* Submit Button */}
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Login"}
          </button>
        </form>

        {/* Links */}
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

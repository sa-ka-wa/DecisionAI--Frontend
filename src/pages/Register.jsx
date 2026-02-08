// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../Pages.Styles/Login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.name ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await api.register({
        username: formData.username,
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (response.success) {
        // Auto login after registration
        const loginResponse = await api.login(
          formData.email,
          formData.password,
        );

        if (loginResponse.success) {
          navigate("/");
          window.location.reload();
        } else {
          navigate("/login");
        }
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="brand">
              <div className="brand-logo">AI</div>
              <div className="brand-text">
                <div className="brand-name">DecisionAI</div>
                <div className="brand-sub">AI-ASSISTED</div>
              </div>
            </div>
            <h1>Create Account</h1>
            <p className="login-subtitle">
              Join DecisionAI and boost your productivity
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 6 characters"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="register-link">
              Already have an account?{" "}
              <Link to="/login" className="register-button">
                Sign in
              </Link>
            </div>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              By creating an account, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>

        <div className="login-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">🚀</div>
            <h2>Start Your Productivity Journey</h2>
            <p>
              Join thousands of users who are making better decisions with
              AI-powered task management.
            </p>
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>Free forever for personal use</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>No credit card required</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>AI-powered insights</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>Cross-platform sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

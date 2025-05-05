// src/components/RegisterPage.js - Fixed unused variable
import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import { AuthContext } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForms.css";

const RegisterPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update this in RegisterPage.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    const form = e.currentTarget;

    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setValidated(true);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setValidated(true);
      return;
    }

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting to register user:", formData.username);

      // Prepare request payload
      const requestBody = {
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        password: formData.password,
      };

      console.log("Registration request payload:", requestBody);

      // Make API call to register endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Registration response status:", response.status);

      // Handle error responses
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message ||
            `Registration failed with status: ${response.status}`;
        } catch (e) {
          const errorText = await response.text();
          errorMessage =
            errorText || `Registration failed with status: ${response.status}`;
        }
        console.error("Registration error response:", errorMessage);
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = await response.json();
      console.log("Registration successful, received data:", data);

      // Auto-login if API provides token
      if (data.token) {
        localStorage.setItem("token", data.token);

        // Create and store user data
        const userData = {
          id: data.userId || data.id,
          username: formData.username,
          email: formData.email,
          role: data.role || "USER",
          isAdmin: data.role === "ADMIN",
        };

        localStorage.setItem("user", JSON.stringify(userData));

        // Navigate to home page
        navigate("/", { replace: true });
      } else {
        // If no token provided, redirect to login
        alert("Registration successful! Please log in.");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Container className="auth-container">
      <Card className="auth-card shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">Create Account</h3>

          {error && (
            <Alert variant="danger" className="mb-3">
              <strong>Registration Error:</strong> {error}
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="regUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                Please pick a username.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="regEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email (optional)"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email address.
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Your email is used for account recovery.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="regPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  required
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  disabled={isLoading}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPass(!showPass)}
                  disabled={isLoading}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  Password must be at least 6 characters.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="regConfirm" className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  required
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={
                    validated && formData.password !== formData.confirmPassword
                  }
                  disabled={isLoading}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={isLoading}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  Passwords do not match.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="d-flex justify-content-center align-items-center"
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Registering...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="me-2" />
                    Register & Log In
                  </>
                )}
              </Button>
            </div>

            <div className="text-center mt-3">
              <small>
                Already have an account? <Link to="/login">Log In</Link>
              </small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPage;
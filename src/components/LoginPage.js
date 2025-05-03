// src/components/LoginPage.js - Enhanced for better authentication flow

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
import { FaEye, FaEyeSlash, FaSignInAlt, FaShoppingCart } from "react-icons/fa";
import { AuthContext } from "./AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./AuthForms.css";

const LoginPage = () => {
  const {
    login,
    error: contextError,
    logout,
    isAuthenticated,
    authRequired,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, default to home
  const from = location.state?.from || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    setIsLoading(true);

    try {
      // First ensure we're logged out to clear any previous state
      logout();

      console.log(`Attempting login with: ${username}`);

      // Attempt login via context method
      const success = await login(username, password);

      if (success) {
        // Navigate to original destination or home
        console.log("Login successful, redirecting to", from);
        navigate(from, { replace: true });
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      {authRequired && (
        <Alert variant="info" className="mb-4 text-center">
          <FaShoppingCart className="me-2" size={20} />
          <strong>Authentication Required</strong>
          <p className="mb-0 mt-2">
            Please log in to view products and make purchases.
          </p>
        </Alert>
      )}

      <Card className="auth-card shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">Welcome Back</h3>

          {error && (
            <Alert variant="danger" className="mb-3">
              <strong>Login Error:</strong> {error}
            </Alert>
          )}

          {contextError && error !== contextError && (
            <Alert variant="danger" className="mb-3">
              <strong>Error:</strong> {contextError}
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="loginUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                Please enter your username.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="loginPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  required
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Please enter your password.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="d-flex align-items-center"
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Logging in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="me-2" />
                    Log In
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <small>
                Don't have an account? <Link to="/register">Register</Link>
              </small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;

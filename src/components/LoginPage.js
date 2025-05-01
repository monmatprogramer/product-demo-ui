// src/components/LoginPage.js - Updated version

import React, { useState, useContext, useEffect } from 'react';
import {
    Container,
    Card,
    Form,
    Button,
    InputGroup,
    Alert,
    Spinner
} from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './AuthForms.css';

const LoginPage = () => {
    const { login, error: contextError, logout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the redirect path from location state, default to home
    const from = location.state?.from || '/';
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated()) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setError('');
        
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
            
            // Direct API call to debug the issue
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: username.trim(), 
                    password 
                })
            });
            
            console.log(`Login response status: ${response.status}`);
            
            if (!response.ok) {
                let errorMessage;
                try {
                    // Try to get error message from response
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || `Login failed with status: ${response.status}`;
                } catch (e) {
                    // If we can't parse JSON, use text
                    const errorText = await response.text();
                    errorMessage = errorText || `Login failed with status: ${response.status}`;
                }
                
                throw new Error(errorMessage);
            }
            
            // Parse successful response
            const data = await response.json();
            console.log("Login successful, received data:", data);
            
            // Store authentication data
            if (data.token) {
                localStorage.setItem('token', data.token);
                
                // Create user object
                const userData = {
                    username: username,
                    isAdmin: data.role === 'ADMIN' || false,
                    role: data.role || 'USER'
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Navigate to original destination
                navigate(from, { replace: true });
                
                // Force page reload to ensure all components recognize the auth state
                window.location.reload();
                
                return;
            }
            
            // If we got here without a token, something's wrong
            throw new Error('Invalid response from server - no token received');
            
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="auth-container">
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
                                onChange={e => setUsername(e.target.value)}
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
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
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
                                        <Spinner as="span" animation="border" size="sm" className="me-2" />
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
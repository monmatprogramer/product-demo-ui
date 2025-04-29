// src/components/RegisterPage.js
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
import { FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForms.css';

const RegisterPage = () => {
    const { register, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setError('');
        
        const form = e.currentTarget;
        
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setValidated(true);
            return;
        }
        
        // Check password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setValidated(true);
            return;
        }
        
        if (!form.checkValidity()) {
            setValidated(true);
            return;
        }

        setIsLoading(true);
        
        try {
            // Using localStorage for persistence in this example
            const storedUsers = localStorage.getItem("adminUsers");
            let users = storedUsers ? JSON.parse(storedUsers) : [];
            
            // Check if username already exists
            if (users.some(user => user.username === formData.username.trim())) {
                throw new Error('Username already exists');
            }
            
            // Create new user object
            const newUser = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                username: formData.username.trim(),
                email: formData.email.trim() || null,
                role: 'USER'
            };
            
            // Add user to array
            users.push(newUser);
            
            // Save to localStorage
            localStorage.setItem("adminUsers", JSON.stringify(users));
            
            // Create a user object for the logged-in session
            const userData = {
                userId: newUser.id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: false
            };
            
            // Store in localStorage (simulating login)
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", "demo-token-" + Math.random().toString(36).substring(2));
            
            // Now we normally would call the register function from context
            // but since we're mocking, we'll redirect directly
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 500);
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register. Please try again.');
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
                                    type={showPass ? 'text' : 'password'}
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
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Re-enter password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    isInvalid={validated && formData.password !== formData.confirmPassword}
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
                                        <Spinner as="span" animation="border" size="sm" className="me-2" />
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
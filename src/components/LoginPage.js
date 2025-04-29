import React, { useState, useContext } from 'react';
import {
    Container,
    Card,
    Form,
    Button,
    InputGroup,
    Modal,
    Alert,
    Spinner
} from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './AuthForms.css';

const LoginPage = () => {
    const { login, error: contextError } = useContext(AuthContext);
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

    // Forgot-password modal
    const [showModal, setShowModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

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
            // Use the login function from AuthContext
            const success = await login(username.trim(), password);
            
            if (!success) {
                throw new Error(contextError || 'Login failed. Please check your credentials.');
            }
            
            // Navigate to the original destination or home
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetLoading(true);
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resetEmail })
            });
            
            // Even if the email doesn't exist, we'll show success for security reasons
            setResetSent(true);
        } catch (err) {
            // Still show success even on error for security
            setResetSent(true);
        } finally {
            setResetLoading(false);
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
                            <Button
                                variant="link"
                                onClick={() => { setShowModal(true); setResetSent(false); setResetError(''); }}
                                disabled={isLoading}
                            >
                                Forgot password?
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

            {/* Forgot Password Modal */}
            <Modal centered show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {resetSent ? (
                        <Alert variant="success">
                            If that email exists, a reset link has been sent.
                        </Alert>
                    ) : (
                        <>
                            {resetError && (
                                <Alert variant="danger">
                                    {resetError}
                                </Alert>
                            )}
                            <Form onSubmit={handleReset}>
                                <Form.Group controlId="resetEmail" className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                        disabled={resetLoading}
                                    />
                                </Form.Group>
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </Form>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default LoginPage;
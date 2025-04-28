import React, { useState, useContext } from 'react';
import {
    Container,
    Card,
    Form,
    Button,
    InputGroup,
    Alert,
    Spinner
} from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForms.css';

const RegisterPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setError('');
        
        const form = e.currentTarget;
        if (!form.checkValidity() || password !== confirm) {
            setValidated(true);
            return;
        }

        setIsLoading(true);
        
        try {
            // Using the proxy configuration - just use the relative path
            // This will automatically be forwarded to localhost:8080
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password
                })
            });

            // Handle non-JSON responses
            let data;
            try {
                data = await response.json();
            } catch (error) {
                console.error('Failed to parse response as JSON', error);
                throw new Error('Server returned an invalid response');
            }
            
            if (!response.ok) {
                throw new Error(data?.message || 'Registration failed');
            }
            
            console.log('Registration successful:', data);
            
            // Login the user
            login(username.trim());
            
            // Navigate to home page
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register. Please try again.');
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
                                placeholder="Choose a username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please pick a username.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="regPassword" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    required
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    minLength={6}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPass(!showPass)}
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
                                    placeholder="Re-enter password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    isInvalid={validated && password !== confirm}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowConfirm(!showConfirm)}
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
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                                        Registering...
                                    </>
                                ) : 'Register & Log In'}
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
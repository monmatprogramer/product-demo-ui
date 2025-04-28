import React, { useState, useContext } from 'react';
import {
    Container,
    Card,
    Form,
    Button,
    InputGroup,
    Modal,
    Alert
} from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './AuthForms.css';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const loc = useLocation();
    const from = loc.state?.from?.pathname || '/';
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [validated, setValidated] = useState(false);

    // Forgot-password modal
    const [showModal, setShowModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.currentTarget;
        if (!form.checkValidity()) {
            setValidated(true);
            return;
        }
        // stub: call real auth API here
        login(username.trim());
        navigate(from, { replace: true });
    };

    const handleReset = (e) => {
        e.preventDefault();
        // stub: call real reset API here
        setResetSent(true);
    };

    return (
        <Container className="auth-container">
            <Card className="auth-card shadow-sm">
                <Card.Body>
                    <h3 className="mb-4 text-center">Welcome Back</h3>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group controlId="loginUsername" className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
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
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    Please enter your password.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Button type="submit" variant="primary">
                                Log In
                            </Button>
                            <Button
                                variant="link"
                                onClick={() => { setShowModal(true); setResetSent(false); }}
                            >
                                Forgot password?
                            </Button>
                        </div>

                        <div className="text-center">
                            <small>
                                Don’t have an account? <Link to="/register">Register</Link>
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
                        <Form onSubmit={handleReset}>
                            <Form.Group controlId="resetEmail" className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    placeholder="you@example.com"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                />
                            </Form.Group>
                            <Button type="submit" variant="primary">
                                Send Reset Link
                            </Button>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default LoginPage;

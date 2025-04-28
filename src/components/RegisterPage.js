import React, { useState, useContext } from 'react';
import {
    Container,
    Card,
    Form,
    Button,
    InputGroup
} from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.currentTarget;
        if (!form.checkValidity() || password !== confirm) {
            setValidated(true);
            return;
        }
        // stub: call real register API here
        login(username.trim());
        navigate('/', { replace: true });
    };

    return (
        <Container className="auth-container">
            <Card className="auth-card shadow-sm">
                <Card.Body>
                    <h3 className="mb-4 text-center">Create Account</h3>
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
                            <Button type="submit" variant="primary">
                                Register & Log In
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegisterPage;

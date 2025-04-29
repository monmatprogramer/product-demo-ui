import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaSave, FaUser, FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

export default function UserFormModal({ user, onClose, onSaved }) {
    const { getAuthHeaders } = useContext(AuthContext);
    const isNew = !user.id;
    
    const [form, setForm] = useState({ 
        username: '', 
        email: '',
        admin: false,
        password: '',
        confirmPassword: ''
    });
    
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!isNew) {
            setForm({ 
                username: user.username || '',
                email: user.email || '',
                admin: user.role === 'ADMIN',
                password: '',
                confirmPassword: ''
            });
        } else {
            setForm({
                username: '',
                email: '',
                admin: false,
                password: '',
                confirmPassword: ''
            });
        }
    }, [user, isNew]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formElement = e.currentTarget;
        
        // Check if passwords match for new users or when changing password
        if (isNew || form.password) {
            if (form.password !== form.confirmPassword) {
                setError("Passwords do not match");
                setValidated(true);
                return;
            }
            
            if (form.password.length < 6) {
                setError("Password must be at least 6 characters");
                setValidated(true);
                return;
            }
        }
        
        if (!formElement.checkValidity()) {
            setValidated(true);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const endpoint = isNew ? '/api/admin/users' : `/api/admin/users/${user.id}`;
            const method = isNew ? 'POST' : 'PUT';
            
            // Prepare the request payload
            const payload = {
                username: form.username,
                email: form.email,
                admin: form.admin
            };
            
            // For new users or password changes, include password fields
            if (isNew || form.password) {
                payload.password = form.password;
                payload.confirmPassword = form.confirmPassword;
            }
            
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Failed to ${isNew ? 'create' : 'update'} user`);
            }
            
            const data = await response.json().catch(() => ({}));
            
            // Create a consistent user object to pass back
            const savedUser = {
                id: data.id || user.id,
                username: data.username || form.username,
                email: data.email || form.email,
                role: data.role || (form.admin ? 'ADMIN' : 'USER')
            };
            
            onSaved(savedUser);
        } catch (err) {
            console.error("Error saving user:", err);
            setError(err.message || `Error ${isNew ? 'creating' : 'updating'} user. Please try again.`);
            setLoading(false);
        }
    };

    return (
        <Modal show centered onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isNew ? (
                        <><FaUser className="me-2" /> Add New User</>
                    ) : (
                        <><FaUserShield className="me-2" /> Edit User</>
                    )}
                </Modal.Title>
            </Modal.Header>
            
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            name="username"
                            type="text"
                            required
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            Username is required
                        </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter a valid email
                        </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {isNew ? "Password" : "New Password"}
                            {!isNew && <small className="text-muted ms-2">(Leave blank to keep current)</small>}
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder={isNew ? "Enter password" : "Enter new password"}
                                required={isNew}
                                minLength={6}
                                disabled={loading}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                            <Form.Control.Feedback type="invalid">
                                {isNew ? "Password is required (min 6 characters)" : "Password must be at least 6 characters"}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {isNew ? "Confirm Password" : "Confirm New Password"}
                        </Form.Label>
                        <Form.Control
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            required={isNew || form.password !== ''}
                            isInvalid={validated && form.password !== form.confirmPassword}
                            disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            Passwords do not match
                        </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="user-admin-switch"
                            label="Admin privileges"
                            name="admin"
                            checked={form.admin}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <Form.Text className="text-muted">
                            Admins have full access to the admin dashboard and all management functions.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaSave className="me-2" />
                                {isNew ? 'Create User' : 'Save Changes'}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
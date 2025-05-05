// src/components/ProductFormModal.js - Removed unused import
import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { FaSave, FaBox, FaDollarSign, FaImage } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import { safeJsonFetch } from '../utils/apiUtils';

const ProductFormModal = ({ product, onSaved, onClose, usingFallbackData = false }) => {
    const { getAuthHeaders } = useContext(AuthContext);
    const isNew = !product.id;
    
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
    });
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isNew) {
            setForm({
                name: product.name || '',
                description: product.description || '',
                price: product.price != null ? product.price.toString() : '',
                imageUrl: product.imageUrl || ''
            });
        } else {
            setForm({
                name: '',
                description: '',
                price: '',
                imageUrl: ''
            });
        }
    }, [product, isNew]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formElement = e.currentTarget;
        
        if (!formElement.checkValidity()) {
            setValidated(true);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Skip API calls if using fallback data
            if (usingFallbackData) {
                console.log("Using fallback data - API calls skipped");
                setTimeout(() => {
                    // Create a mock response with the form data
                    const mockProduct = {
                        ...product, // Keep existing properties like ID for updates
                        name: form.name,
                        description: form.description,
                        price: parseFloat(form.price),
                        imageUrl: form.imageUrl || undefined
                    };
                    
                    // For new products, add an ID
                    if (isNew) {
                        mockProduct.id = Date.now(); // Use timestamp as mock ID
                    }
                    
                    onSaved(mockProduct);
                }, 1000);
                return;
            }
            
            // Prepare payload
            const payload = {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price)
            };
            
            // Only include imageUrl if it's provided
            if (form.imageUrl.trim()) {
                payload.imageUrl = form.imageUrl.trim();
            }
            
            // Use safeJsonFetch for API calls
            let endpoint = isNew ? '/products' : `/products/${product.id}`;
            const method = isNew ? 'POST' : 'PUT';
            
            console.log(`Making ${method} request to ${endpoint}`, payload);
            
            // Make the API call
            const savedProduct = await safeJsonFetch(endpoint, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            
            console.log('API response:', savedProduct);
            onSaved(savedProduct);
            
        } catch (err) {
            console.error("Error saving product:", err);
            setError(err.message || `Error ${isNew ? 'creating' : 'updating'} product. Please try again.`);
            setLoading(false);
        }
    };

    return (
        <Modal show centered onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isNew ? (
                        <><FaBox className="me-2" /> Add New Product</>
                    ) : (
                        <><FaBox className="me-2" /> Edit Product</>
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
                    
                    {usingFallbackData && (
                        <Alert variant="warning" className="mb-3">
                            <small>API not available. Changes will be simulated.</small>
                        </Alert>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control
                            name="name"
                            type="text"
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            Product name is required
                        </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            disabled={loading}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaDollarSign />
                            </InputGroup.Text>
                            <Form.Control
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={form.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                disabled={loading}
                            />
                            <Form.Control.Feedback type="invalid">
                                Valid price is required
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Image URL (optional)</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaImage />
                            </InputGroup.Text>
                            <Form.Control
                                name="imageUrl"
                                type="url"
                                value={form.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                disabled={loading}
                            />
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Leave blank to use a default image based on product name
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
                                {isNew ? 'Create Product' : 'Save Changes'}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ProductFormModal = ({ product, onSaved, onClose }) => {
    const isNew = !product.id;
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: ''
    });

    useEffect(() => {
        if (!isNew) {
            setForm({
                name: product.name || '',
                description: product.description || '',
                price: product.price != null ? product.price : ''
            });
        }
    }, [product, isNew]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isNew
            ? '/api/products'
            : `/api/products/${product.id}`;
        const method = isNew ? 'POST' : 'PUT';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, price: parseFloat(form.price) })
        })
            .then(r => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then(onSaved)
            .catch(() => alert('Error saving product.'));
    };

    return (
        <Modal show onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{isNew ? 'Add Product' : 'Edit Product'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            value={form.price}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        {isNew ? 'Create' : 'Save'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;

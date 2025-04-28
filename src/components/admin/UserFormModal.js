import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function UserFormModal({ user, onClose, onSaved }) {
    const isNew = !user.id;
    const [form, setForm] = useState({ username: '', isAdmin: false });

    useEffect(() => {
        if (!isNew) {
            setForm({ username: user.username, isAdmin: user.isAdmin });
        }
    }, [user, isNew]);

    const change = e =>
        setForm({
            ...form,
            [e.target.name]: e.target.type === 'checkbox'
                ? e.target.checked
                : e.target.value
        });

    const save = e => {
        e.preventDefault();
        const url = isNew ? '/api/users' : `/api/users/${user.id}`;
        const method = isNew ? 'POST' : 'PUT';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then(r => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then(onSaved)
            .catch(() => alert('Error saving user.'));
    };

    return (
        <Modal show onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{isNew ? 'Add User' : 'Edit User'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={save}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            name="username"
                            required
                            value={form.username}
                            onChange={change}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Admin"
                            name="isAdmin"
                            checked={form.isAdmin}
                            onChange={change}
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
}

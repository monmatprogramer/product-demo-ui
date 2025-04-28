import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import UserFormModal from './UserFormModal';

export default function UserManagement() {
    const [users, setUsers] = useState(null);
    const [current, setCurrent] = useState(null);

    const reload = () =>
        fetch('/api/users')
            .then(r => r.json())
            .then(setUsers);

    useEffect(reload, []);

    const del = id => {
        if (!window.confirm('Delete this user?')) return;
        fetch(`/api/users/${id}`, { method: 'DELETE' }).then(reload);
    };

    if (!users) return <Spinner animation="border" />;

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button onClick={() => setCurrent({})}>+ New User</Button>
            </div>
            <Table hover responsive>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(u => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.isAdmin ? 'Admin' : 'User'}</td>
                        <td>
                            <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-2"
                                onClick={() => setCurrent(u)}
                            >
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => del(u.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {current !== null && (
                <UserFormModal
                    user={current}
                    onClose={() => setCurrent(null)}
                    onSaved={() => {
                        setCurrent(null);
                        reload();
                    }}
                />
            )}
        </>
    );
}

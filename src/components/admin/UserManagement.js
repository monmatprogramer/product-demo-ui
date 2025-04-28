import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUserPlus, FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';
import UserFormModal from './UserFormModal';
import { safeJsonFetch } from '../../utils/apiUtils';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [current, setCurrent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await safeJsonFetch('/api/users');
            setUsers(data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users. Please try again later.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete user');
            await fetchUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user. Please try again.");
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="admin-title mb-0">User Management</h2>
                <Button 
                    variant="primary" 
                    onClick={() => setCurrent({})}
                    className="d-flex align-items-center"
                >
                    <FaUserPlus className="me-2" /> Add User
                </Button>
            </div>
            
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {loading ? (
                <div className="loading-container">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        
                    </div>
                    <h4>No Users Found</h4>
                    <p className="empty-state-text">
                        There are no users in the system yet. Create your first user to get started.
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => setCurrent({})}
                    >
                        <FaUserPlus className="me-2" /> Add First User
                    </Button>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            {user.isAdmin ? 
                                                <FaUserShield className="me-2 text-primary" /> : 
                                                <FaUserShield className="me-2 text-secondary" />
                                            }
                                            {user.username}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.isAdmin ? 'bg-primary' : 'bg-secondary'}`}>
                                            {user.isAdmin ? 'Admin' : 'Customer'}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2 action-btn"
                                            onClick={() => setCurrent(user)}
                                        >
                                            <FaEdit className="me-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="action-btn"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            <FaTrash className="me-1" /> Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {current !== null && (
                <UserFormModal
                    user={current}
                    onClose={() => setCurrent(null)}
                    onSaved={() => {
                        setCurrent(null);
                        fetchUsers();
                    }}
                />
            )}
        </>
    );
}
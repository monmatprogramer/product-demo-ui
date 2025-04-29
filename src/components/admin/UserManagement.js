import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, InputGroup, Form } from 'react-bootstrap';
import { FaUserPlus, FaEdit, FaTrash, FaUserShield, FaSearch, FaSync } from 'react-icons/fa';
import UserFormModal from './UserFormModal';
import { AuthContext } from '../../context/AuthContext';
import './AdminStyles.css';

export default function UserManagement() {
    const { getAuthHeaders, refreshAccessToken } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [current, setCurrent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);

    const fetchUsers = async (withRetry = true) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/admin/users', {
                headers: getAuthHeaders()
            });

            if (response.status === 401 && withRetry) {
                // Token might be expired, try to refresh it
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Try again with new token
                    return fetchUsers(false);
                }
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to load users: ${response.statusText}`);
            }
            
            const data = await response.json();
            setUsers(data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message || "Failed to load users. Please try again later.");
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const response = await fetch(`/api/admin/users/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete user');
            }
            
            setUsers(users.filter(user => user.id !== id));
            
            // Show success as temporary message in place of the error
            setError('User deleted successfully');
            setTimeout(() => setError(null), 3000);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.message || "Failed to delete user. Please try again.");
        }
    };

    // Handle successful save from modal
    const handleUserSaved = (savedUser) => {
        setCurrent(null);
        
        // Update users list - either add new or update existing
        if (savedUser.id) {
            setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
        } else {
            fetchUsers(); // Refetch all to get server-assigned ID
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user => 
        searchTerm === '' || 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm)
    );

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="admin-title mb-0">User Management</h2>
                <div className="d-flex">
                    <Button 
                        variant="outline-primary" 
                        className="me-2 d-flex align-items-center"
                        onClick={() => {
                            setIsRetrying(true);
                            fetchUsers();
                        }}
                        disabled={isRetrying}
                    >
                        <FaSync className={isRetrying ? "me-2 fa-spin" : "me-2"} /> Refresh
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => setCurrent({})}
                        className="d-flex align-items-center"
                    >
                        <FaUserPlus className="me-2" /> Add User
                    </Button>
                </div>
            </div>
            
            {error && (
                <Alert 
                    variant={error.includes('success') ? "success" : "danger"} 
                    dismissible 
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
            
            <div className="mb-4">
                <InputGroup>
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search users by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FaUserShield size={48} />
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
            ) : filteredUsers.length === 0 ? (
                <Alert variant="info">
                    No users match your search. Try a different term or clear the search.
                </Alert>
            ) : (
                <div className="table-responsive">
                    <Table hover className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            {user.role === 'ADMIN' ? 
                                                <FaUserShield className="me-2 text-primary" /> : 
                                                <FaUserShield className="me-2 text-secondary" />
                                            }
                                            {user.username}
                                        </div>
                                    </td>
                                    <td>{user.email || '—'}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'ADMIN' ? 'bg-primary' : 'bg-secondary'}`}>
                                            {user.role || 'USER'}
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
                                            disabled={user.username === 'admin'} // Protect admin user
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
                    onSaved={handleUserSaved}
                />
            )}
        </>
    );
}
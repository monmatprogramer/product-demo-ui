import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Table, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSync, FaUserEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

function MyComponent() {
    // Get auth context
    const { user, getAuthHeaders, isAuthenticated } = useContext(AuthContext);
    
    // Component state
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Function to fetch users data with authentication
    const fetchUsers = async () => {
        // Reset state
        setLoading(true);
        setError(null);
        
        try {
            // Make authenticated request
            const response = await fetch('/api/admin/users', {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            
            // Check for HTTP errors
            if (!response.ok) {
                // Try to get error details from response
                let errorMessage = 'Failed to fetch users';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    // If response isn't JSON, use status text
                    errorMessage = `${errorMessage}: ${response.statusText}`;
                }
                
                throw new Error(errorMessage);
            }
            
            // Parse response data
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message || 'An error occurred while fetching users');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            
            // Remove deleted user from state
            setUsers(users.filter(user => user.id !== userId));
            
            // Show success message
            alert('User deleted successfully');
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.message || 'Failed to delete user');
        }
    };
    
    // Fetch data on component mount
    useEffect(() => {
        // Only fetch if user is authenticated
        if (isAuthenticated()) {
            fetchUsers();
        } else {
            setError('You must be logged in to view this content');
            setLoading(false);
        }
    }, []);
    
    // Show appropriate content based on auth state
    if (!isAuthenticated()) {
        return (
            <Alert variant="warning">
                You need to be logged in with admin privileges to access this page.
            </Alert>
        );
    }
    
    // Check if user has admin privileges
    if (user && !user.isAdmin) {
        return (
            <Alert variant="danger">
                You don't have permission to access this page. Admin privileges required.
            </Alert>
        );
    }

    return (
        <Card className="my-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">User Management</h3>
                <div>
                    <Button 
                        variant="outline-primary" 
                        className="me-2"
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        <FaSync className={loading ? "spin me-2" : "me-2"} />
                        Refresh
                    </Button>
                    <Button variant="primary">
                        <FaUserPlus className="me-2" />
                        Add User
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" role="status" variant="primary">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <Alert variant="info">
                        No users found in the system.
                    </Alert>
                ) : (
                    <div className="table-responsive">
                        <Table hover bordered>
                            <thead className="bg-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email || '—'}</td>
                                        <td>
                                            <span className={`badge bg-${user.isAdmin ? 'primary' : 'secondary'}`}>
                                                {user.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td>
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm" 
                                                className="me-2"
                                                title="Edit user"
                                            >
                                                <FaUserEdit />
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                title="Delete user"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card.Body>
            <Card.Footer className="text-muted">
                {users.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Total users: {users.length}</span>
                        <span>Admins: {users.filter(u => u.isAdmin).length}</span>
                    </div>
                )}
            </Card.Footer>
        </Card>
    );
}

export default MyComponent;
// src/components/admin/UserManagement.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Card,
  Modal,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  FaSync,
  FaUserEdit,
  FaTrash,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaSearch,
} from "react-icons/fa";

export default function UserManagement() {
  // Get auth context with proper functions
  const { user, getAuthHeaders, isAuthenticated } = useContext(AuthContext);

  // Component state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User edit/create modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [validated, setValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    admin: false,
  });

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  // Function to fetch users data with authentication
  function fetchUsers() {
    // Reset state
    setLoading(true);
    setError(null);
    setIsRefreshing(true);
  
    try {
      // For development mode, use direct API call without CORS issues
      const apiUrl = '/api/admin/users'; // This will be proxied by setupProxy.js
      console.log("Fetching users from:", apiUrl);
      
      const headers = getAuthHeaders();
      console.log("Using auth headers:", headers);
      
      fetch(apiUrl, {
        method: "GET",
        headers: headers
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Users fetched successfully:", data);
        setUsers(data || []);
        setError(null);
      })
      .catch(err => {
        console.error("API fetch error:", err);
        setError(`Error fetching users: ${err.message}. Please try again later.`);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
    } catch (err) {
      console.error("Exception during fetch setup:", err);
      setError(`An unexpected error occurred: ${err.message}`);
      setLoading(false);
      setIsRefreshing(false);
      setUsers([]);
    }
  }

  // Helper function to create default users if none exist
  const createAndUseDefaultUsers = () => {
    const defaultUsers = [
      {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "ADMIN"
      },
      {
        id: 2,
        username: "mat1",
        email: "mat1@test.com",
        role: "ADMIN"
      }
    ];
    localStorage.setItem("adminUsers", JSON.stringify(defaultUsers));
    setUsers(defaultUsers);
    setError("Could not connect to backend API. Using default data.");
  };

  // Open user edit modal
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUserForm({
      username: user.username,
      email: user.email || "",
      password: "",
      confirmPassword: "",
      admin: user.role === "ADMIN",
    });
    setModalMode("edit");
    setModalError("");
    setValidated(false);
    setShowModal(true);
  };

  // Open user creation modal
  const handleAddUser = () => {
    setCurrentUser(null);
    setUserForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      admin: false,
    });
    setModalMode("create");
    setModalError("");
    setValidated(false);
    setShowModal(true);
  };

  // Open delete confirmation modal
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    // Validation checks
    if (modalMode === "create" || userForm.password) {
      if (userForm.password.length < 6) {
        setModalError("Password must be at least 6 characters");
        setValidated(true);
        return;
      }

      if (userForm.password !== userForm.confirmPassword) {
        setModalError("Passwords do not match");
        setValidated(true);
        return;
      }
    }

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      // If already using local storage, don't attempt API calls
      if (usingLocalStorage) {
        handleLocalStorageUpdate();
        return;
      }

      // Prepare request body
      const requestBody = {
        username: userForm.username,
        email: userForm.email || null,
        role: userForm.admin ? "ADMIN" : "USER",
        // Only include password if creating or changing password
        ...(modalMode === "create" || userForm.password
          ? { password: userForm.password }
          : {})
      };

      // Determine correct API endpoint based on operation
      const url = modalMode === "create"
        ? "/api/admin/users"
        : `/api/admin/users/${currentUser.id}`;

      // Make the API request
      const response = await fetch(url, {
        method: modalMode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(requestBody)
      });

      // Handle response
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server error: ${response.status}`;
        } catch (jsonError) {
          const errorText = await response.text();
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      await response.json();
      
      // Update UI
      setShowModal(false);
      setError(`User ${modalMode === "create" ? "created" : "updated"} successfully`);
      
      // Refresh user list
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error saving user:", err);
      
      // If API fails, offer localStorage fallback
      if (window.confirm(`API request failed. Would you like to update the local storage for demonstration purposes?`)) {
        handleLocalStorageUpdate();
      } else {
        setModalError(`Failed to ${modalMode} user: ${err.message}`);
        setModalLoading(false);
      }
    }
  };

  // Helper function to update localStorage
  const handleLocalStorageUpdate = () => {
    try {
      // Update localStorage for demo purposes
      const storedUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      
      if (modalMode === "create") {
        // Create new user in localStorage
        const newUser = {
          id: storedUsers.length > 0 ? Math.max(...storedUsers.map(u => u.id)) + 1 : 1,
          username: userForm.username,
          email: userForm.email || null,
          role: userForm.admin ? "ADMIN" : "USER"
        };
        
        storedUsers.push(newUser);
      } else {
        // Update existing user in localStorage
        const userIndex = storedUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          storedUsers[userIndex] = {
            ...storedUsers[userIndex],
            username: userForm.username,
            email: userForm.email || null,
            role: userForm.admin ? "ADMIN" : "USER"
          };
        }
      }
      
      localStorage.setItem("adminUsers", JSON.stringify(storedUsers));
      setUsers(storedUsers);
      setUsingLocalStorage(true);
      
      // Close modal and show success message
      setShowModal(false);
      setError(`User ${modalMode === "create" ? "created" : "updated"} in localStorage (Demo mode)`);
      setTimeout(() => setError(null), 3000);
    } catch (storageError) {
      console.error("Error updating localStorage:", storageError);
      setModalError(`Failed to update user in localStorage: ${storageError.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // If already using localStorage, don't attempt API call
      if (usingLocalStorage) {
        handleLocalStorageDelete();
        return;
      }
      
      // Make API request to delete user
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${response.status} ${errorText}`);
      }

      // Show success message
      setError("User deleted successfully");
      
      // Refresh user list
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      
      // If API fails, offer localStorage fallback
      if (window.confirm(`API request failed. Would you like to delete from local storage for demonstration purposes?`)) {
        handleLocalStorageDelete();
      } else {
        setError(`Failed to delete user: ${err.message}`);
      }
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Helper function to delete from localStorage
  const handleLocalStorageDelete = () => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      const updatedUsers = storedUsers.filter(u => u.id !== userToDelete.id);
      localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setUsingLocalStorage(true);
      setError("User deleted from localStorage (Demo mode)");
      setTimeout(() => setError(null), 3000);
    } catch (storageError) {
      console.error("Error updating localStorage:", storageError);
      setError(`Failed to delete user from localStorage: ${storageError.message}`);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    // Only fetch if user is authenticated
    if (isAuthenticated()) {
      fetchUsers();
    } else {
      setError("You must be logged in to view this content");
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      searchTerm === "" ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toString().includes(searchTerm)
  );

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
        You don't have permission to access this page. Admin privileges
        required.
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
            onClick={() => {
              setIsRefreshing(true);
              fetchUsers();
            }}
            disabled={loading || isRefreshing}
          >
            <FaSync className={isRefreshing ? "spin me-2" : "me-2"} />
            Refresh
          </Button>
          <Button variant="primary" onClick={handleAddUser} disabled={loading}>
            <FaUserPlus className="me-2" />
            Add User
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert
            variant={error.includes("success") ? "success" : error.includes("Could not connect") ? "warning" : "danger"}
            dismissible
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {usingLocalStorage && (
          <Alert variant="info" className="mb-3">
            <strong>Using Local Storage Mode:</strong> Changes are only stored in your browser and will not persist to the server.
          </Alert>
        )}

        <div className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search users by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <Alert variant="info">No users found in the system.</Alert>
        ) : filteredUsers.length === 0 ? (
          <Alert variant="info">No users match your search criteria.</Alert>
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
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email || "—"}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "ADMIN" ? "bg-primary" : "bg-secondary"
                        }`}
                      >
                        {user.role || "USER"}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        title="Edit user"
                        onClick={() => handleEditUser(user)}
                      >
                        <FaUserEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        title="Delete user"
                        onClick={() => confirmDelete(user)}
                        disabled={user.username === "admin"} // Protect admin user
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
            <span>
              Admins: {users.filter((u) => u.role === "ADMIN").length}
            </span>
          </div>
        )}
      </Card.Footer>

      {/* User Edit/Create Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "create" ? "Add New User" : "Edit User"}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
          <Modal.Body>
            {modalError && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setModalError(null)}
              >
                {modalError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={userForm.username}
                onChange={handleFormChange}
                required
                placeholder="Enter username"
                disabled={modalLoading}
              />
              <Form.Control.Feedback type="invalid">
                Username is required
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleFormChange}
                placeholder="Enter email (optional)"
                disabled={modalLoading}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {modalMode === "create" ? "Password" : "New Password"}
                {modalMode === "edit" && (
                  <small className="text-muted ms-2">
                    (Leave blank to keep current)
                  </small>
                )}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userForm.password}
                  onChange={handleFormChange}
                  required={modalMode === "create"}
                  minLength={6}
                  placeholder={
                    modalMode === "create"
                      ? "Enter password"
                      : "Enter new password (optional)"
                  }
                  disabled={modalLoading}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={modalLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {modalMode === "create"
                    ? "Password is required (min 6 characters)"
                    : "Password must be at least 6 characters"}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {modalMode === "create"
                  ? "Confirm Password"
                  : "Confirm New Password"}
              </Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={userForm.confirmPassword}
                onChange={handleFormChange}
                required={modalMode === "create" || userForm.password !== ""}
                isInvalid={
                  validated && userForm.password !== userForm.confirmPassword
                }
                placeholder="Confirm password"
                disabled={modalLoading}
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
                checked={userForm.admin}
                onChange={handleFormChange}
                disabled={modalLoading}
              />
              <Form.Text className="text-muted">
                Admins have full access to the admin dashboard and all
                management functions.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={modalLoading}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={modalLoading}>
              {modalLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : modalMode === "create" ? (
                "Create User"
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <p>
              Are you sure you want to delete the user{" "}
              <strong>{userToDelete.username}</strong>? This action cannot be
              undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
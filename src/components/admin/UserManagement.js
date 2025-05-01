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

  // Function to fetch users data with authentication
  const fetchUsers = async () => {
    // Reset state
    setLoading(true);
    setError(null);
    setIsRefreshing(true);

    try {
      // First attempt: Try to fetch from API
      try {
        console.log("Fetching users from backend API...");
        
        // Get headers from the auth context
        const headers = getAuthHeaders();
        console.log("Using auth headers:", headers);
        
        const response = await fetch("http://localhost:8080/api/admin/users", {
          method: "GET",
          headers: headers
        });

        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        console.log("Users fetched successfully:", data);
        setUsers(data || []);
        setError(null);
        return; // Exit early if successful
      } catch (apiError) {
        console.error("API fetch error:", apiError);
        throw apiError; // Re-throw to be caught by outer try-catch
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      
      // Fallback: Use mock data or localStorage data
      console.log("Falling back to mock/localStorage data");
      
      // Check if we have stored users in localStorage
      const storedUsers = localStorage.getItem("adminUsers");
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          setUsers(parsedUsers);
          setError(`Could not connect to backend API. Using stored data instead. (${err.message})`);
        } catch (parseError) {
          console.error("Error parsing stored users:", parseError);
          setUsers([]);
          setError(`Failed to load users. (${err.message})`);
        }
      } else {
        // Create default admin user if no users exist
        const defaultUsers = [
          {
            id: 1,
            username: "admin",
            email: "admin@example.com",
            role: "ADMIN"
          }
        ];
        localStorage.setItem("adminUsers", JSON.stringify(defaultUsers));
        setUsers(defaultUsers);
        setError(`Could not connect to backend API. Using default data. (${err.message})`);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
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
      // Get headers
      const headers = getAuthHeaders();
      console.log("Using auth headers for user update:", headers);

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

      console.log("Preparing request body:", requestBody);

      // Determine correct API endpoint based on operation
      const url = modalMode === "create"
        ? "http://localhost:8080/api/admin/users" // User creation endpoint
        : `http://localhost:8080/api/admin/users/${currentUser.id}`; // User update endpoint

      console.log(`Sending ${modalMode === "create" ? "POST" : "PUT"} request to: ${url}`);
      
      // Make the API request
      const response = await fetch(url, {
        method: modalMode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers
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
      const responseData = await response.json().catch(() => ({}));
      console.log("API Response:", responseData);

      // Update UI
      setShowModal(false);
      setError(`User ${modalMode === "create" ? "created" : "updated"} successfully`);
      
      // Refresh user list
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error saving user:", err);
      setModalError(`Failed to ${modalMode} user: ${err.message}`);
      
      // Fallback to localStorage for demo/development
      if (!window.confirm(`API request failed. Would you like to update the local storage for demonstration purposes?`)) {
        setModalLoading(false);
        return;
      }
      
      try {
        // Fallback: Update localStorage for demo purposes
        console.log("Falling back to localStorage update");
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
        
        // Close modal and show success message
        setShowModal(false);
        setError(`User ${modalMode === "create" ? "created" : "updated"} in localStorage (Demo mode)`);
        setTimeout(() => setError(null), 3000);
      } catch (storageError) {
        console.error("Error updating localStorage:", storageError);
        setModalError(`Failed to update user in localStorage: ${storageError.message}`);
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Get headers
      const headers = getAuthHeaders();
      console.log("Using auth headers for user deletion:", headers);
      
      console.log(`Sending DELETE request to: http://localhost:8080/api/admin/users/${userToDelete.id}`);
      
      // Make the API request
      const response = await fetch(`http://localhost:8080/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: headers
      });

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Delete Error:", errorText);
        throw new Error(`Failed to delete user: ${response.status}`);
      }

      // Show success message
      setError("User deleted successfully");
      
      // Refresh user list
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(`Failed to delete user: ${err.message}`);
      
      // Fallback to localStorage for demo/development
      if (window.confirm(`API request failed. Would you like to delete from local storage for demonstration purposes?`)) {
        try {
          // Fallback: Delete from localStorage for demo purposes
          console.log("Falling back to localStorage deletion");
          const storedUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
          const updatedUsers = storedUsers.filter(u => u.id !== userToDelete.id);
          localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
          setUsers(updatedUsers);
          setError("User deleted from localStorage (Demo mode)");
          setTimeout(() => setError(null), 3000);
        } catch (storageError) {
          console.error("Error updating localStorage:", storageError);
          setError(`Failed to delete user from localStorage: ${storageError.message}`);
        }
      }
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
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
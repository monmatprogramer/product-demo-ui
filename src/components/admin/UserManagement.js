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
import axios from "axios";

// API base URL - replace with your actual backend URL
const API_URL = "http://localhost:8080/api/admin";

export default function UserManagement() {
  // Get auth context
  const { user, isAuthenticated, getAuthHeaders } = useContext(AuthContext);

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

  // Function to fetch users data from API
  const fetchUsers = async () => {
    // Reset state
    setLoading(true);
    setError(null);
    setIsRefreshing(true);

    try {
      // Make API request to get users
      const response = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeaders(),
      });

      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while fetching users. Please try again."
      );

      // If API is not available, use localStorage for demo purposes
      const storedUsers = localStorage.getItem("adminUsers");
      if (storedUsers) {
        try {
          setUsers(JSON.parse(storedUsers));
        } catch (parseError) {
          console.error("Error parsing stored users:", parseError);
          setUsers([]);
        }
      } else {
        setUsers([]);
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

  // Handle form submission - create or update user
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    // Check password validation
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
      if (modalMode === "create") {
        // Create new user via API
        const response = await axios.post(
          `${API_URL}/users`,
          {
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            admin: userForm.admin,
          },
          {
            headers: getAuthHeaders(),
          }
        );

        // Update local state with the new user
        const newUser = response.data.user;
        setUsers((prevUsers) => [...prevUsers, newUser]);
      } else {
        // Update existing user via API
        const response = await axios.put(
          `${API_URL}/users/${currentUser.id}`,
          {
            username: userForm.username,
            email: userForm.email,
            admin: userForm.admin,
            ...(userForm.password ? { password: userForm.password } : {}),
          },
          {
            headers: getAuthHeaders(),
          }
        );

        // Update local state with the updated user
        const updatedUser = response.data.user;
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );
      }

      // Close modal and show success message
      setShowModal(false);
      setError(
        `User ${modalMode === "create" ? "created" : "updated"} successfully`
      );

      // Refresh the user list
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} user:`,
        err
      );
      setModalError(
        err.response?.data?.message ||
          `Failed to ${modalMode} user. Please try again.`
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Delete user via API
      await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
        headers: getAuthHeaders(),
      });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete.id)
      );

      // Show success message
      setError("User deleted successfully");
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
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
            variant={error.includes("success") ? "success" : "danger"}
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

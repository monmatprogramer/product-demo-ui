import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup,
  Tabs,
  Tab,
  Badge,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaSave,
} from "react-icons/fa";
import { AuthContext } from "./AuthContext";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // Sample order history
  const [orders] = useState([
    {
      id: "2301",
      date: "2023-03-15",
      items: 3,
      total: 649.97,
      status: "Delivered",
    },
    {
      id: "1872",
      date: "2023-02-01",
      items: 1,
      total: 129.5,
      status: "Delivered",
    },
    {
      id: "1543",
      date: "2022-12-10",
      items: 2,
      total: 1935.0,
      status: "Delivered",
    },
  ]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "user@example.com", // Simulated email
        phone: user.phone || "",
        address: user.address || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation if changing password
    if (profile.password) {
      if (profile.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (profile.password !== profile.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    // Clear any previous alerts
    setError("");

    // In a real app, you would send this data to your backend
    // For now, we'll just update the local context

    // const updatedUser = {
    //   ...user,
    //   username: profile.username,
    //   email: profile.email,
    //   phone: profile.phone,
    //   address: profile.address,
    // };

    // Update the AuthContext
    login(profile.username);

    // Update localStorage for demo purposes to persist some extra fields
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      })
    );

    setSuccess("Profile updated successfully!");
    setEditing(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(""), 3000);
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container className="profile-container py-5">
      <h2 className="mb-4">My Account</h2>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 profile-tabs"
      >
        <Tab eventKey="profile" title="Profile">
          <Card className="profile-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Personal Information</h3>
                <Button
                  variant={editing ? "outline-secondary" : "outline-primary"}
                  className="edit-button"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? (
                    "Cancel"
                  ) : (
                    <>
                      <FaEdit className="me-2" /> Edit
                    </>
                  )}
                </Button>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-2 text-primary" />
                        Username
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-2 text-primary" />
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPhone className="me-2 text-primary" />
                        Phone
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Enter your phone number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        Address
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Enter your address"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {editing && (
                  <>
                    <h5 className="mt-4 mb-3">Change Password (Optional)</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={profile.password}
                              onChange={handleChange}
                              placeholder="Leave blank to keep current"
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={profile.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                      <Button type="submit" variant="success">
                        <FaSave className="me-2" /> Save Changes
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="orders" title="Order History">
          <Card className="order-history-card">
            <Card.Body>
              <h3 className="mb-4">Your Orders</h3>

              {orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{new Date(order.date).toLocaleDateString()}</td>
                          <td>{order.items}</td>
                          <td>${order.total.toFixed(2)}</td>
                          <td>
                            <Badge
                              bg={
                                order.status === "Delivered"
                                  ? "success"
                                  : order.status === "Shipped"
                                  ? "info"
                                  : order.status === "Processing"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert variant="info">You haven't placed any orders yet.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ProfilePage;

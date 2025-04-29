import React, { useContext, useState } from "react";
import {
  Navbar,
  Container,
  InputGroup,
  Form,
  Nav,
  Badge,

  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,

  FaUser,
  FaSignOutAlt,
  FaClipboardList,

  FaShieldAlt,
} from "react-icons/fa";
import { AuthContext } from "./AuthContext";
import "./NavbarBar.css";

const NavbarBar = ({ searchValue, onSearch, cartCount }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get first letter of username for avatar
  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  // Random color based on username for avatar background
  const getAvatarColor = (username) => {
    if (!username) return "#007bff";

    const colors = [
      "#3498db", // blue
      "#9b59b6", // purple
      "#e74c3c", // red
      "#1abc9c", // teal
      "#f39c12", // orange
      "#2ecc71", // green
    ];

    const charCode = username.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <Navbar expand="lg" className="appbar sticky-top">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="logo-icon">🖥️</span>
          <span className="logo-text">Computer Store</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-collapse" />
        <Navbar.Collapse id="navbar-collapse" className="justify-content-end">
          {/* Search */}
          <InputGroup className="search-group me-3">
            <InputGroup.Text className="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search products…"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
            />
          </InputGroup>

          {/* Cart */}
          <Nav className="me-3">
            <Nav.Link as={Link} to="/cart" className="cart-link">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <Badge pill bg="danger" className="cart-badge">
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>

          {/* User Profile */}
          {user ? (
            <div className="profile-menu-container">
              <div
                className="profile-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div
                  className="user-avatar"
                  style={{ backgroundColor: getAvatarColor(user.username) }}
                >
                  {getInitial(user.username)}
                </div>
                <span className="username d-none d-md-inline">
                  {user.username}
                </span>
                <span className="dropdown-arrow"></span>
              </div>

              <div
                className={`profile-dropdown-menu ${
                  showDropdown ? "show" : ""
                }`}
              >
                <div className="dropdown-header">
                  <div className="d-flex align-items-center">
                    <div
                      className="user-avatar-large"
                      style={{ backgroundColor: getAvatarColor(user.username) }}
                    >
                      {getInitial(user.username)}
                    </div>
                    <div className="ms-3">
                      <div className="user-name">{user.username}</div>
                      <div className="user-role">
                        {user.isAdmin ? "Administrator" : "Customer"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dropdown-body">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaUser className="item-icon" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaClipboardList className="item-icon" />
                    <span>My Orders</span>
                  </Link>

                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FaShieldAlt className="item-icon" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>

                <div className="dropdown-footer">
                  <button
                    className="logout-btn"
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                  >
                    <FaSignOutAlt className="item-icon" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Overlay to close dropdown when clicking outside */}
              {showDropdown && (
                <div
                  className="dropdown-overlay"
                  onClick={() => setShowDropdown(false)}
                />
              )}
            </div>
          ) : (
            <Button
              as={Link}
              to="/login"
              variant="outline-primary"
              className="login-button"
            >
              <FaUser className="me-2" />
              Log In
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarBar;

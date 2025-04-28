import React, { useContext } from 'react';
import {
    Navbar,
    Container,
    InputGroup,
    Form,
    Nav,
    Badge,
    NavDropdown,
    Image
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './NavbarBar.css';

const NavbarBar = ({ searchValue, onSearch, cartCount }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar expand="lg" className="appbar sticky-top">
            <Container fluid>
                {/* Logo */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <span className="logo-icon">🖥️</span>
                    <span className="logo-text">Computer Store</span>
                </Navbar.Brand>

                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    {/* Search */}
                    <InputGroup className="search-group me-3">
                        <InputGroup.Text className="search-icon">
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search products…"
                            value={searchValue}
                            onChange={e => onSearch(e.target.value)}
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

                    {/* Admin link, only for admins */}
                    {user?.isAdmin && (
                        <Nav className="me-3">
                            <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                        </Nav>
                    )}

                    {/* User Profile or Login */}
                    <Nav>
                        {user ? (
                            <NavDropdown 
                                title={
                                    <div className="profile-icon-container">
                                        <FaUserCircle size={24} className="profile-icon" />
                                        <span className="ms-2 d-none d-md-inline">{user.username}</span>
                                    </div>
                                } 
                                id="profile-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login">Log in</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarBar;
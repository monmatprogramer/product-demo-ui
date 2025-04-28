import React, { useContext } from 'react';
import {
    Navbar,
    Container,
    InputGroup,
    Form,
    Nav,
    Badge
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './NavbarBar.css';

/* ─── ORIGINAL (keep for reference) ────────────────────────────

const NavbarBar = ({ searchValue, onSearch, cartCount }) => (
  <Navbar expand="lg" className="appbar sticky-top">
    <Container fluid>
      <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
        <span className="logo-icon">🖥️</span>
        <span className="logo-text">Computer Store</span>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="appbar-nav" />
      <Navbar.Collapse id="appbar-nav" className="justify-content-end">

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

        <Link to="/cart" className="cart-link">
          <FaShoppingCart size={20} />
          {cartCount > 0 && (
            <Badge pill bg="danger" className="cart-badge">
              {cartCount}
            </Badge>
          )}
        </Link>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default NavbarBar;

─────────────────────────────────────────────────────── */


// ─── ENHANCED (active implementation) ─────────────────────────
const NavbarBar = ({ searchValue, onSearch, cartCount }) => {
    const { user, logout } = useContext(AuthContext);

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

                    {/* Login/logout */}
                    <Nav>
                        {user ? (
                            <Nav.Link onClick={logout}>Log out</Nav.Link>
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

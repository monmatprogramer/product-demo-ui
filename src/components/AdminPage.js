// src/components/AdminPage.js
import React, { useContext } from 'react';
import { Container, Row, Col, Nav, Alert, Button } from 'react-bootstrap'; // Added Button import
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaBox, 
    FaUsers, 
    FaChartBar, 
    FaFileAlt,
    FaExclamationTriangle
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './AdminPage.css';

export default function AdminPage() {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Check authentication and admin status
    if (!isAuthenticated()) {
        return (
            <Container fluid className="py-5">
                <Alert variant="warning" className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-2" />
                    <div>
                        You need to be logged in to access the admin panel.
                        <Button 
                            variant="link" 
                            className="ps-2"
                            onClick={() => navigate('/login', { state: { from: '/admin' } })}
                        >
                            Log in now
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }
    
    if (!user?.isAdmin) {
        return (
            <Container fluid className="py-5">
                <Alert variant="danger" className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-2" />
                    <div>
                        You don't have permission to access the admin panel. Admin privileges required.
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="admin-container py-4">
            <Row className="g-4">
                <Col lg={2} md={3}>
                    <div className="admin-sidebar">
                        <Nav variant="pills" className="flex-column admin-nav">
                            <Nav.Link as={NavLink} to="/admin" end>
                                <FaTachometerAlt /> Dashboard
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/products">
                                <FaBox /> Products
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/users">
                                <FaUsers /> Users
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/reports">
                                <FaFileAlt /> Reports
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/analytics">
                                <FaChartBar /> Analytics
                            </Nav.Link>
                        </Nav>
                    </div>
                </Col>
                <Col lg={10} md={9}>
                    <div className="admin-content">
                        <Outlet />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
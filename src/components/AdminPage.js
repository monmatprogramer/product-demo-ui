import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaBox, 
    FaUsers, 
    FaChartBar, 
    FaFileAlt 
} from 'react-icons/fa';
import './AdminPage.css';

export default function AdminPage() {
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
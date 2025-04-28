import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminPage.css';

export default function AdminPage() {
    return (
        <Container fluid className="py-4">
            <Row>
                <Col md={2}>
                    <Nav variant="pills" className="flex-column admin-nav">
                        <Nav.Link as={NavLink} to="" end>
                            Dashboard
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="products">
                            Products
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="users">
                            Users
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="reports">
                            Reports
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="analytics">
                            Analytics
                        </Nav.Link>
                    </Nav>
                </Col>
                <Col md={10}>
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
}

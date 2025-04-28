import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <Container className="text-center py-5">
            <h3>404 — Page Not Found</h3>
            <Button variant="link" onClick={() => navigate('/')}>
                Go Home
            </Button>
        </Container>
    );
};

export default NotFound;

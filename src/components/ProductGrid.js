import React, { useContext } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { AuthContext } from './AuthContext';

const ProductGrid = ({ products, onViewDetails }) => {
  const { authRequired, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // If authentication is required and user is not authenticated, show login prompt
  if (authRequired && !isAuthenticated()) {
    return (
      <Alert variant="info" className="text-center py-4">
        <h4>Authentication Required</h4>
        <p>Please log in to view available products.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/login', { state: { from: '/' } })}
          className="mt-2"
        >
          Log In
        </Button>
      </Alert>
    );
  }

  // If there are no products to display (but auth is not the issue)
  if (products.length === 0) {
    return (
      <Col xs={12}>
        <p className="text-center text-muted py-5">No products found.</p>
      </Col>
    );
  }

  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map(p => (
        <Col key={p.id}>
          <ProductCard product={p} onViewDetails={() => onViewDetails(p)} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
import React, { useContext } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { AuthContext } from './AuthContext';

const ProductGrid = ({ products, onViewDetails }) => {
  const { authRequired } = useContext(AuthContext);
  const navigate = useNavigate();

  // If authentication is required and there are no products, show login prompt
  if (authRequired && products.length === 0) {
    return (
      <Alert variant="info" className="text-center py-4">
        <h4>Authentication Required</h4>
        <p>Please log in to view available products.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/login')}
          className="mt-2"
        >
          Log In
        </Button>
      </Alert>
    );
  }

  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map(p => (
        <Col key={p.id}>
          <ProductCard product={p} onViewDetails={() => onViewDetails(p)} />
        </Col>
      ))}
      {products.length === 0 && (
        <Col xs={12}>
          <p className="text-center text-muted py-5">No products found.</p>
        </Col>
      )}
    </Row>
  );
};

export default ProductGrid;
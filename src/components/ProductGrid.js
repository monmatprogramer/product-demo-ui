import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onViewDetails }) => (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map(p => (
          <Col key={p.id}>
            <ProductCard product={p} onViewDetails={() => onViewDetails(p)} />
          </Col>
      ))}
      {products.length === 0 && (
          <Col>
            <p className="text-center text-muted">No products found.</p>
          </Col>
      )}
    </Row>
);

export default ProductGrid;

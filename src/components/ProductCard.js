import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getImageSrc, handleImgError } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const viewDetails = () => {
        localStorage.setItem('lastViewed', product.id);
        navigate(`/product/${product.id}`);
    };

    return (
        <Card className="h-100 product-card">
            <div className="card-img-container">
                <Card.Img
                    src={getImageSrc(product)}
                    onError={e => handleImgError(e, product.name)}
                    alt={product.name}
                    className="card-img-top"
                />
            </div>
            <Card.Body className="d-flex flex-column">
                <Card.Title>{product.name}</Card.Title>
                <Card.Text className="text-muted mb-3">
                    {product.description}
                </Card.Text>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="h5 text-primary">${product.price.toFixed(2)}</span>
                    <Button variant="secondary" size="sm" onClick={viewDetails}>
                        View Details
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;

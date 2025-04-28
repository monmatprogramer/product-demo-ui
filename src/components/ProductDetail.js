import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    Button,
    Spinner,
    Row,
    Col,
    Form,
    Tabs,
    Tab,
} from 'react-bootstrap';
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';
import { getImageSrc, handleImgError } from '../utils/imageUtils';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('desc');
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then(r => {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            })
            .then(setProduct)
            .catch(() => navigate('/', { replace: true }));
    }, [id, navigate]);

    if (!product) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
            </div>
        );
    }

    // Sample static rating for demo
    const rating = 4.5;
    const stars = Array.from({ length: 5 }, (_, i) => {
        if (rating >= i + 1) return <FaStar key={i} />;
        if (rating >= i + 0.5) return <FaStarHalf key={i} />;
        return <FaRegStar key={i} />;
    });

    return (
        <Container className="detail-container">
            <Button
                variant="link"
                className="mb-3 text-decoration-none"
                onClick={() => navigate(-1)}
            >
                ← Back to products
            </Button>

            <Card className="detail-card shadow">
                <Row className="g-0">
                    <Col md={6} className="detail-img-col">
                        <Card.Img
                            src={getImageSrc(product)}
                            onError={e => handleImgError(e, product.name)}
                            alt={product.name}
                            className="detail-img"
                        />
                    </Col>
                    <Col md={6}>
                        <Card.Body className="detail-body">
                            <h2 className="detail-title">{product.name}</h2>
                            <div className="detail-rating mb-3">{stars} <span className="text-muted">(24 reviews)</span></div>

                            {/* Price + Quantity + CTA */}
                            <div className="d-flex align-items-center mb-4">
                                <h3 className="text-primary me-4">${product.price.toFixed(2)}</h3>
                                <Form.Select
                                    value={qty}
                                    onChange={e => setQty(+e.target.value)}
                                    style={{ width: '80px', marginRight: '1rem' }}
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </Form.Select>
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={() => {
                                        // reuse your cart util
                                        import('../utils/cartUtils').then(({ addToCart }) => {
                                            addToCart({ ...product, qty });
                                            navigate('/cart');
                                        });
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </div>

                            {/* Tabbed details */}
                            <Tabs
                                activeKey={activeTab}
                                onSelect={k => setActiveTab(k)}
                                className="mb-3"
                            >
                                <Tab eventKey="desc" title="Description">
                                    <p>{product.description}</p>
                                </Tab>
                                <Tab eventKey="spec" title="Specifications">
                                    {/* Example specs, replace with real data */}
                                    <ul>
                                        <li>Model: XYZ-{product.id}</li>
                                        <li>Brand: Acme Computers</li>
                                        <li>Warranty: 1 year</li>
                                    </ul>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
};

export default ProductDetail;

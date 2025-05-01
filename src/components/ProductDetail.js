import React, { useEffect, useState, useContext } from 'react';
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
    Alert
} from 'react-bootstrap';
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';
import { getImageSrc, handleImgError } from '../utils/imageUtils';
import { AuthContext } from '../components/AuthContext';
import './ProductDetail.css';

// Mock product data for fallback
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with RGB keyboard and latest GPU for smooth gaming experience. Features a high refresh rate display and enhanced cooling system for extended gaming sessions.",
    price: 1299.99,
    imageUrl: ""
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    description: "Tactile mechanical keyboard with customizable backlighting and programmable macros. Durable construction with premium switches for faster response times.",
    price: 129.99,
    imageUrl: ""
  },
  {
    id: 3,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with long battery life and precision tracking. Features adjustable DPI settings and customizable buttons for productivity and gaming.",
    price: 59.99,
    imageUrl: ""
  },
  {
    id: 4,
    name: "LED Monitor",
    description: "27-inch LED monitor with high refresh rate and vibrant color accuracy. Ultra-thin bezels for immersive viewing experience with multiple connectivity options.",
    price: 249.99,
    imageUrl: ""
  },
  {
    id: 5,
    name: "USB Hub",
    description: "Multi-port USB hub with fast charging capabilities and data transfer. Sleek design with individual power switches for each port.",
    price: 39.99,
    imageUrl: ""
  },
  {
    id: 6,
    name: "External SSD",
    description: "Fast external SSD with USB-C connectivity and durable aluminum casing. High-speed transfers with substantial storage capacity for all your digital needs.",
    price: 89.99,
    imageUrl: ""
  }
];

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('desc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        // Try to fetch product details from API
        const fetchProductDetail = async () => {
            try {
                // Use auth headers if user is logged in
                const headers = auth.isAuthenticated() ? auth.getAuthHeaders() : {};
                
                console.log(`Fetching product ${id} with auth:`, auth.isAuthenticated());
                const response = await fetch(`/api/products/${id}`, { headers });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch product: ${response.status}`);
                }
                
                const data = await response.json();
                console.log("Fetched product:", data);
                setProduct(data);
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error("Error fetching product:", err);
                
                // Try to find a matching mock product
                const mockProduct = MOCK_PRODUCTS.find(p => p.id.toString() === id);
                
                if (mockProduct) {
                    console.log("Using mock product:", mockProduct);
                    setProduct(mockProduct);
                    setError("Using demo product data due to API connection issues.");
                } else {
                    setError("Product not found. The product may have been removed or you may have followed an invalid link.");
                }
                
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id, auth]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!product) {
        return (
            <Container className="detail-container">
                <Button
                    variant="link"
                    className="mb-3 text-decoration-none"
                    onClick={() => navigate(-1)}
                >
                    ← Back to products
                </Button>
                
                <Alert variant="danger">
                    <Alert.Heading>Product Not Found</Alert.Heading>
                    <p>
                        The product you're looking for doesn't exist or couldn't be loaded.
                        Please try again or browse our other products.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Browse Products
                    </Button>
                </Alert>
            </Container>
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

            {error && (
                <Alert variant="warning" className="mb-3">
                    {error}
                </Alert>
            )}

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
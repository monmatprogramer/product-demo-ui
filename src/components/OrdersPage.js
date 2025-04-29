import React, { useState, useContext } from 'react';
import {
    Container,
    Card,
    Alert,
    Badge,
    Button,
    Row,
    Col,
    Modal
} from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { FaBoxOpen, FaShippingFast, FaCheckCircle } from 'react-icons/fa';
import './OrdersPage.css';

const OrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Sample order history
    const [orders] = useState([
        { 
            id: '2301', 
            date: '2023-03-15', 
            items: [
                { id: 1, name: 'Cosmic Byte Artemis Keyboard', qty: 1, price: 45.00 },
                { id: 2, name: 'Gaming Laptop', qty: 1, price: 1899.99 },
                { id: 3, name: 'Mechanical Keyboard', qty: 1, price: 129.50 }
            ],
            total: 2074.49, 
            status: 'Delivered',
            address: '123 Main St, Apt 4B, New York, NY 10001',
            tracking: 'UPS1234567890'
        },
        { 
            id: '1872', 
            date: '2023-02-01', 
            items: [
                { id: 4, name: 'Mechanical Keyboard', qty: 1, price: 129.50 }
            ],
            total: 129.50, 
            status: 'Delivered',
            address: '123 Main St, Apt 4B, New York, NY 10001',
            tracking: 'USPS9876543210'
        },
        { 
            id: '1543', 
            date: '2022-12-10', 
            items: [
                { id: 5, name: 'Gaming Laptop', qty: 1, price: 1899.99 },
                { id: 6, name: 'Camo Keycap', qty: 1, price: 35.00 }
            ],
            total: 1934.99, 
            status: 'Delivered',
            address: '123 Main St, Apt 4B, New York, NY 10001',
            tracking: 'FEDEX5647382910'
        }
    ]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Processing':
                return <FaBoxOpen className="status-icon processing" />;
            case 'Shipped':
                return <FaShippingFast className="status-icon shipped" />;
            case 'Delivered':
                return <FaCheckCircle className="status-icon delivered" />;
            default:
                return null;
        }
    };

    const getStatusVariant = (status) => {
        switch(status) {
            case 'Processing': return 'warning';
            case 'Shipped': return 'info';
            case 'Delivered': return 'success';
            default: return 'secondary';
        }
    };

    if (!user) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="warning">
                    Please log in to view your orders.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="orders-container py-5">
            <h2 className="mb-4">My Orders</h2>
            
            {orders.length > 0 ? (
                orders.map(order => (
                    <Card key={order.id} className="order-card mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="order-number">Order #{order.id}</span>
                                <span className="order-date ms-3">
                                    {new Date(order.date).toLocaleDateString()}
                                </span>
                            </div>
                            <Badge bg={getStatusVariant(order.status)} className="status-badge">
                                {getStatusIcon(order.status)} {order.status}
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            <div className="order-items mb-3">
                                {order.items.map(item => (
                                    <div key={item.id} className="order-item d-flex justify-content-between align-items-center py-2">
                                        <div>
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty ms-2 text-muted">× {item.qty}</span>
                                        </div>
                                        <span className="item-price">${item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="order-total d-flex justify-content-between align-items-center pt-3 border-top">
                                <span className="total-label">Total:</span>
                                <span className="total-amount">${order.total.toFixed(2)}</span>
                            </div>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end">
                            <Button 
                                variant="outline-primary" 
                                onClick={() => setSelectedOrder(order)}
                            >
                                View Details
                            </Button>
                        </Card.Footer>
                    </Card>
                ))
            ) : (
                <Alert variant="info">
                    You haven't placed any orders yet.
                </Alert>
            )}
            
            {/* Order Details Modal */}
            <Modal
                show={selectedOrder !== null}
                onHide={() => setSelectedOrder(null)}
                size="lg"
                centered
            >
                {selectedOrder && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Order Details #{selectedOrder.id}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="order-status-banner mb-4">
                                <Badge bg={getStatusVariant(selectedOrder.status)} className="status-badge-lg">
                                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                                </Badge>
                            </div>
                            
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h5>Shipping Information</h5>
                                    <p className="mb-1"><strong>Address:</strong></p>
                                    <p className="text-muted">{selectedOrder.address}</p>
                                    
                                    {selectedOrder.tracking && (
                                        <>
                                            <p className="mb-1"><strong>Tracking Number:</strong></p>
                                            <p className="text-muted">{selectedOrder.tracking}</p>
                                        </>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h5>Order Information</h5>
                                    <p className="mb-1">
                                        <strong>Order Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Total Items:</strong> {selectedOrder.items.reduce((acc, item) => acc + item.qty, 0)}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Order Total:</strong> ${selectedOrder.total.toFixed(2)}
                                    </p>
                                </Col>
                            </Row>
                            
                            <h5>Order Items</h5>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th className="text-center">Quantity</th>
                                            <th className="text-end">Price</th>
                                            <th className="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td className="text-center">{item.qty}</td>
                                                <td className="text-end">${item.price.toFixed(2)}</td>
                                                <td className="text-end">${(item.price * item.qty).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                            <td className="text-end"><strong>${selectedOrder.total.toFixed(2)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" onClick={() => setSelectedOrder(null)}>
                                Close
                            </Button>
                            <Button variant="primary">
                                Download Invoice
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Container>
    );
};

export default OrdersPage;
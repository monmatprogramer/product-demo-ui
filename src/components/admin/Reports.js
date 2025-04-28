import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Badge, Form, Row, Col, Button } from 'react-bootstrap';
import { FaFileAlt, FaFileDownload, FaSearch, FaFilter } from 'react-icons/fa';
import { safeJsonFetch } from '../../utils/apiUtils';

export default function Reports() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await safeJsonFetch('/api/orders');
                setOrders(data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load order reports. Please try again later.");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, []);

    // Filter orders based on search term and date range
    const filteredOrders = orders.filter(order => {
        const searchMatch = filter === '' || 
            order.id?.toString().includes(filter) || 
            order.user?.username?.toLowerCase().includes(filter.toLowerCase());
        
        // Date filter logic
        let dateMatch = true;
        const orderDate = new Date(order.date);
        
        if (dateRange.start && !isNaN(new Date(dateRange.start))) {
            dateMatch = dateMatch && orderDate >= new Date(dateRange.start);
        }
        
        if (dateRange.end && !isNaN(new Date(dateRange.end))) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59); // Include the entire end day
            dateMatch = dateMatch && orderDate <= endDate;
        }
        
        return searchMatch && dateMatch;
    });

    // Calculate totals for filtered orders
    const totalSales = filteredOrders.reduce((sum, order) => {
        const orderTotal = order.total || 
            (order.items ? order.items.reduce((s, i) => s + i.qty * i.price, 0) : 0);
        return sum + orderTotal;
    }, 0);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilter('');
        setDateRange({ start: '', end: '' });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="admin-title mb-0">Order Reports</h2>
                <Button 
                    variant="outline-primary"
                    className="d-flex align-items-center"
                >
                    <FaFileDownload className="me-2" /> Export Report
                </Button>
            </div>
            
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Filter Options</h5>
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Search</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaSearch />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Order ID or customer..."
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="start"
                                    value={dateRange.start}
                                    onChange={handleDateChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="end"
                                    value={dateRange.end}
                                    onChange={handleDateChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                            <Button 
                                variant="secondary" 
                                className="w-100"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
            
            <div className="card mb-4">
                <div className="card-body">
                    <Row className="text-center">
                        <Col md={4}>
                            <h6 className="text-muted">Orders</h6>
                            <h4>{filteredOrders.length}</h4>
                        </Col>
                        <Col md={4}>
                            <h6 className="text-muted">Total Sales</h6>
                            <h4 className="text-success">${totalSales.toFixed(2)}</h4>
                        </Col>
                        <Col md={4}>
                            <h6 className="text-muted">Avg. Order Value</h6>
                            <h4>${filteredOrders.length ? (totalSales / filteredOrders.length).toFixed(2) : '0.00'}</h4>
                        </Col>
                    </Row>
                </div>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FaFileAlt />
                    </div>
                    <h4>No Orders Found</h4>
                    <p className="empty-state-text">
                        {orders.length === 0 
                            ? "There are no orders in the system yet."
                            : "No orders match the current filters. Try adjusting your search criteria."}
                    </p>
                    {orders.length > 0 && (
                        <Button variant="secondary" onClick={clearFilters}>
                            <FaFilter className="me-2" /> Clear Filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover className="admin-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const orderTotal = order.total || 
                                    (order.items ? order.items.reduce((s, i) => s + i.qty * i.price, 0) : 0);
                                const itemCount = order.items ? order.items.reduce((s, i) => s + i.qty, 0) : 0;
                                
                                return (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.user?.username || `User #${order.userId || 'Unknown'}`}</td>
                                        <td>{new Date(order.date).toLocaleDateString()}</td>
                                        <td>{itemCount}</td>
                                        <td className="text-end">${orderTotal.toFixed(2)}</td>
                                        <td>
                                            <Badge bg={
                                                order.status === 'Delivered' ? 'success' :
                                                order.status === 'Shipped' ? 'info' :
                                                order.status === 'Processing' ? 'warning' : 'secondary'
                                            }>
                                                {order.status || 'Processing'}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}
        </>
    );
}
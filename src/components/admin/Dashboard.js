import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaBox, FaUsers, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { safeJsonFetch } from '../../utils/apiUtils';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [products, users, orders] = await Promise.all([
                    safeJsonFetch('/api/products'),
                    safeJsonFetch('/api/users'),
                    safeJsonFetch('/api/orders')
                ]);
                
                const productsData = products || [];
                const usersData = users || [];
                const ordersData = orders || [];
                
                const sales = ordersData.reduce(
                    (sum, o) =>
                        sum + (o.total != null
                            ? o.total
                            : o.items ? o.items.reduce((acc, i) => acc + i.qty * i.price, 0) : 0),
                    0
                );
                
                setStats({
                    products: productsData.length,
                    users: usersData.length,
                    orders: ordersData.length,
                    sales
                });
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please try again later.");
                // Set default stats to avoid UI issues
                setStats({ products: 0, users: 0, orders: 0, sales: 0 });
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    return (
        <>
            <h2 className="admin-title">Dashboard</h2>
            <Row className="g-4">
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon products-icon">
                            <FaBox />
                        </div>
                        <h3 className="stat-value">{stats.products}</h3>
                        <p className="stat-label">Products</p>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon users-icon">
                            <FaUsers />
                        </div>
                        <h3 className="stat-value">{stats.users}</h3>
                        <p className="stat-label">Users</p>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon orders-icon">
                            <FaShoppingCart />
                        </div>
                        <h3 className="stat-value">{stats.orders}</h3>
                        <p className="stat-label">Orders</p>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon sales-icon">
                            <FaDollarSign />
                        </div>
                        <h3 className="stat-value">${stats.sales.toFixed(2)}</h3>
                        <p className="stat-label">Total Sales</p>
                    </Card>
                </Col>
            </Row>
        </>
    );
}
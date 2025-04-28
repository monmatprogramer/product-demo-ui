import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import{safeJsonFetch}from'../../utils/apiUtils';

export default function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        Promise.all([
            safeJsonFetch('/api/products'),
            safeJsonFetch('/api/users'),
            safeJsonFetch('/api/orders')
        ])
            .then(([products, users, orders]) => {
                const sales = orders.reduce(
                    (sum, o) =>
                        sum + (o.total != null
                            ? o.total
                            : o.items.reduce((acc, i) => acc + i.qty * i.price, 0)),
                    0
                );
                setStats({
                    products: products.length,
                    users: users.length,
                    orders: orders.length,
                    sales
                });
            })
            .catch(() => setStats({ products: 0, users: 0, orders: 0, sales: 0 }));
    }, []);

    if (!stats) return <Spinner animation="border" />;

    return (
        <Row className="g-4">
            <Col md={3}>
                <Card className="p-3 text-center">
                    <h5>Products</h5>
                    <h2>{stats.products}</h2>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="p-3 text-center">
                    <h5>Users</h5>
                    <h2>{stats.users}</h2>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="p-3 text-center">
                    <h5>Orders</h5>
                    <h2>{stats.orders}</h2>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="p-3 text-center">
                    <h5>Total Sales</h5>
                    <h2>${stats.sales.toFixed(2)}</h2>
                </Card>
            </Col>
        </Row>
    );
}

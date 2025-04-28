import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';

export default function Analytics() {
    const [data, setData] = useState(null);

    useEffect(() => {
        // reuse the same stats used by Dashboard
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/users').then(r => r.json()),
            fetch('/api/orders').then(r => r.json())
        ]).then(([prods, users, ords]) => {
            const sales = ords.reduce(
                (sum, o) =>
                    sum + (o.total != null
                        ? o.total
                        : o.items.reduce((acc, i) => acc + i.qty * i.price, 0)),
                0
            );
            setData({ prods, users, ords, sales });
        });
    }, []);

    if (!data) return <Spinner animation="border" />;

    // you can swap these cards for actual charts later
    return (
        <Row className="g-4">
            <Col md={6}>
                <Card className="p-3">
                    <h5>Sales Over Time</h5>
                    <div>📈 chart placeholder</div>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="p-3">
                    <h5>User Growth</h5>
                    <div>📈 chart placeholder</div>
                </Card>
            </Col>
        </Row>
    );
}

import React, { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';

export default function Reports() {
    const [orders, setOrders] = useState(null);

    useEffect(() => {
        fetch('/api/orders')
            .then(r => r.json())
            .then(setOrders);
    }, []);

    if (!orders) return <Spinner animation="border" />;

    return (
        <Table hover responsive>
            <thead>
            <tr>
                <th>Order #</th>
                <th>User</th>
                <th>Total</th>
                <th>Date</th>
            </tr>
            </thead>
            <tbody>
            {orders.map(o => (
                <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.user?.username || o.userId}</td>
                    <td>${(o.total || o.items.reduce((s,i)=>s+i.qty*i.price,0)).toFixed(2)}</td>
                    <td>{new Date(o.date).toLocaleString()}</td>
                </tr>
            ))}
            </tbody>
        </Table>
    );
}

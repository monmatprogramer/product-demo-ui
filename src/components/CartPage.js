import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { getCart, clearCart } from '../utils/cartUtils';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    useEffect(() => {
        setCart(getCart());
    }, []);

    const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

    if (cart.length === 0) {
        return (
            <Container className="py-5 text-center">
                <h3>Your cart is empty</h3>
                <Button variant="primary" onClick={() => navigate('/')}>
                    Shop Products
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2>Your Cart</h2>
            <Table hover responsive className="mt-4">
                <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Subtotal</th>
                </tr>
                </thead>
                <tbody>
                {cart.map(p => (
                    <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.qty}</td>
                        <td className="text-primary text-end">${p.price.toFixed(2)}</td>
                        <td className="text-end">${(p.price * p.qty).toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td className="text-end"><strong>${total.toFixed(2)}</strong></td>
                </tr>
                </tfoot>
            </Table>

            <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    ← Continue Shopping
                </Button>

                <div>
                    <Button variant="danger" className="me-2" onClick={() => { clearCart(); setCart([]); }}>
                        Clear Cart
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => {
                            if (!user) {
                                // redirect to login, preserving intended destination
                                navigate('/login', { state: { from: '/checkout' } });
                                return;
                            }
                            navigate('/checkout');
                        }}
                    >
                        Proceed to Checkout
                    </Button>

                </div>
            </div>
        </Container>
    );
};

export default CartPage;

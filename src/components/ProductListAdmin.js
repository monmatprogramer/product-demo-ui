import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import ProductFormModal from './ProductFormModal';

const ProductListAdmin = () => {
    const [products, setProducts] = useState(null);
    const [modalProduct, setModalProduct] = useState(null);  // null => closed; {} => new; {...} => edit

    const fetchAll = () => {
        fetch('/api/products')
            .then(r => r.json())
            .then(setProducts);
    };

    useEffect(fetchAll, []);

    const handleDelete = (id) => {
        if (!window.confirm('Delete this product?')) return;
        fetch(`/api/products/${id}`, { method: 'DELETE' })
            .then(() => fetchAll());
    };

    if (!products) {
        return <Spinner animation="border" />;
    }

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button onClick={() => setModalProduct({})}>+ New Product</Button>
            </div>

            <Table hover responsive>
                <thead>
                <tr>
                    <th>ID</th><th>Name</th><th>Price</th><th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {products.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>
                            <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-2"
                                onClick={() => setModalProduct(p)}
                            >
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(p.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {modalProduct !== null && (
                <ProductFormModal
                    product={modalProduct}
                    onSaved={() => {
                        setModalProduct(null);
                        fetchAll();
                    }}
                    onClose={() => setModalProduct(null)}
                />
            )}
        </>
    );
};

export default ProductListAdmin;

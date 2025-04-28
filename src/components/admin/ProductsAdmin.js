import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBox } from 'react-icons/fa';
import ProductFormModal from '../ProductFormModal';
import { safeJsonFetch } from '../../utils/apiUtils';

export default function ProductsAdmin() {
    const [products, setProducts] = useState([]);
    const [modalProduct, setModalProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await safeJsonFetch('/api/products');
            setProducts(data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again later.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete product');
            await fetchProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
            setError("Failed to delete product. Please try again.");
        }
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product => 
        searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id?.toString().includes(searchTerm)
    );

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="admin-title mb-0">Product Management</h2>
                <Button 
                    variant="primary" 
                    onClick={() => setModalProduct({})}
                    className="d-flex align-items-center"
                >
                    <FaPlus className="me-2" /> Add Product
                </Button>
            </div>
            
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            <div className="mb-4">
                <InputGroup>
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FaBox />
                    </div>
                    <h4>No Products Found</h4>
                    <p className="empty-state-text">
                        There are no products in the system yet. Create your first product to get started.
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => setModalProduct({})}
                    >
                        <FaPlus className="me-2" /> Add First Product
                    </Button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <Alert variant="info">
                    No products match your search. Try a different term or clear the search.
                </Alert>
            ) : (
                <div className="table-responsive">
                    <Table hover className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th className="text-end">Price</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>#{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>
                                        {product.description ? (
                                            product.description.length > 50 
                                                ? `${product.description.substring(0, 50)}...` 
                                                : product.description
                                        ) : (
                                            <span className="text-muted">No description</span>
                                        )}
                                    </td>
                                    <td className="text-end text-primary">${product.price.toFixed(2)}</td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2 action-btn"
                                            onClick={() => setModalProduct(product)}
                                        >
                                            <FaEdit className="me-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="action-btn"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            <FaTrash className="me-1" /> Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {modalProduct !== null && (
                <ProductFormModal
                    product={modalProduct}
                    onSaved={() => {
                        setModalProduct(null);
                        fetchProducts();
                    }}
                    onClose={() => setModalProduct(null)}
                />
            )}
        </>
    );
}
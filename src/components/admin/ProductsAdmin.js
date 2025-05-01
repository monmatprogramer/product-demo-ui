import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBox } from 'react-icons/fa';
import ProductFormModal from '../ProductFormModal';
import { safeJsonFetch } from '../../utils/apiUtils';

// Mock product data
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with RGB keyboard",
    price: 1299.99,
    imageUrl: ""
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    description: "Tactile mechanical keyboard with customizable backlighting",
    price: 129.99,
    imageUrl: ""
  },
  {
    id: 3,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with long battery life",
    price: 59.99,
    imageUrl: ""
  },
  {
    id: 4,
    name: "LED Monitor",
    description: "27-inch LED monitor with high refresh rate",
    price: 249.99,
    imageUrl: ""
  },
  {
    id: 5,
    name: "USB Hub",
    description: "Multi-port USB hub with fast charging",
    price: 39.99,
    imageUrl: ""
  },
  {
    id: 6,
    name: "External SSD",
    description: "Fast external SSD with USB-C connectivity",
    price: 89.99,
    imageUrl: ""
  }
];

export default function ProductsAdmin() {
    const [products, setProducts] = useState([]);
    const [modalProduct, setModalProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [usingMockData, setUsingMockData] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await safeJsonFetch('/api/products');
            
            // Check if we got valid data
            if (Array.isArray(data) && data.length > 0) {
                setProducts(data);
                setError(null);
                setUsingMockData(false);
            } else {
                console.log("API returned empty or invalid data, using mock data");
                setProducts(MOCK_PRODUCTS);
                setError("Could not retrieve products from the server. Using demo data instead.");
                setUsingMockData(true);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products from server. Using demo data instead.");
            setProducts(MOCK_PRODUCTS);
            setUsingMockData(true);
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
            if (usingMockData) {
                // Handle delete in mock data
                const updatedProducts = products.filter(product => product.id !== id);
                setProducts(updatedProducts);
                setError("Product deleted in demo mode (changes are not saved to server)");
                return;
            }
            
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete product');
            await fetchProducts();
            setError("Product deleted successfully");
            setTimeout(() => setError(null), 3000);
        } catch (err) {
            console.error("Error deleting product:", err);
            setError("Failed to delete product. Please try again.");
        }
    };

    // Handle saving product in mock mode
    const handleSaveMockProduct = (product) => {
        let updatedProducts;
        
        if (product.id) {
            // Update existing product
            updatedProducts = products.map(p => 
                p.id === product.id ? { ...product } : p
            );
        } else {
            // Create new product with new ID
            const newId = Math.max(...products.map(p => p.id), 0) + 1;
            updatedProducts = [...products, { ...product, id: newId }];
        }
        
        setProducts(updatedProducts);
        setModalProduct(null);
        setError("Product saved in demo mode (changes are not saved to server)");
        setTimeout(() => setError(null), 3000);
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
                <Alert 
                    variant={error.includes("demo") ? "warning" : error.includes("successfully") ? "success" : "danger"} 
                    dismissible 
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
            
            {usingMockData && (
                <Alert variant="info" className="mb-3">
                    <strong>Demo Mode Active:</strong> You are viewing mock product data. Changes will not be saved to the server.
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
                    onSaved={(savedProduct) => {
                        if (usingMockData) {
                            handleSaveMockProduct(savedProduct);
                        } else {
                            setModalProduct(null);
                            fetchProducts();
                        }
                    }}
                    onClose={() => setModalProduct(null)}
                />
            )}
        </>
    );
}
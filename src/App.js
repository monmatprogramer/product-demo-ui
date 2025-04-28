// src/App.js
import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import NavbarBar     from './components/NavbarBar';
import Hero          from './components/Hero';
import Sidebar       from './components/Sidebar';
import SortControl   from './components/SortControl';
import ProductGrid   from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import CartPage      from './components/CartPage';
import CheckoutPage  from './components/CheckoutPage';
import LoginPage     from './components/LoginPage';
import RegisterPage  from './components/RegisterPage';
import ProfilePage   from './components/ProfilePage';
import OrdersPage    from './components/OrdersPage';
import NotFound      from './components/NotFound';
import Loader        from './components/Loader';

import { getCart }      from './utils/cartUtils';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute     from './components/PrivateRoute';

import './App.css';
import AdminPage from "./components/AdminPage";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./components/admin/Dashboard";
import ProductsAdmin from "./components/admin/ProductsAdmin";
import UserManagement from "./components/admin/UserManagement";
import Reports from "./components/admin/Reports";
import Analytics from "./components/admin/Analytics";

function App() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [category, setCategory]     = useState('All');
  const [sortOrder, setSortOrder]   = useState('');
  const navigate = useNavigate();

  const cartCount = getCart().reduce((sum, p) => sum + p.qty, 0);

  useEffect(() => {
    fetch('/api/products')
        .then(r => r.json())
        .then(data => { setProducts(data); setLoading(false); })
        .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const setCats = new Set(['All']);
    products.forEach(p => {
      const last = p.name.split(' ').pop();
      setCats.add(last.endsWith('s') ? last : last + 's');
    });
    return Array.from(setCats);
  }, [products]);

  const filtered = useMemo(() => {
    let arr = category === 'All'
        ? products
        : products.filter(p => {
          const last = p.name.split(' ').pop();
          return (last.endsWith('s') ? last : last + 's') === category;
        });
    if (query) {
      arr = arr.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (sortOrder === 'asc')  arr.sort((a,b) => a.price - b.price);
    if (sortOrder === 'desc') arr.sort((a,b) => b.price - a.price);
    return arr;
  }, [products, category, query, sortOrder]);

  if (loading) return <Loader />;

  return (
      <AuthProvider>
        <NavbarBar searchValue={query} onSearch={setQuery} cartCount={cartCount} />

        <Routes>
          <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Container fluid>
                    <Row>
                      <Col md={2} className="mb-4">
                        <Sidebar
                            categories={categories}
                            selected={category}
                            onSelect={c => { setCategory(c); setSortOrder(''); }}
                        />
                      </Col>
                      <Col md={10}>
                        <SortControl sortOrder={sortOrder} onSortChange={setSortOrder} />
                        <ProductGrid
                            products={filtered}
                            onViewDetails={p => {
                              localStorage.setItem('lastViewed', p.id);
                              navigate(`/product/${p.id}`);
                            }}
                        />
                      </Col>
                    </Row>
                  </Container>
                </>
              }
          />

          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart"         element={<CartPage />} />
          <Route
              path="/admin"
              element={
                  <AdminRoute>
                      <AdminPage />
                  </AdminRoute>
              }
          >

          </Route>
          {/* Public auth routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
              path="/admin/*"
              element={
                  <AdminRoute>
                      <AdminPage />
                  </AdminRoute>
              }
          >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* User profile routes */}
          <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
          />
          <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              }
          />

          {/* Protected checkout */}
          <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
  );
}

export default App;
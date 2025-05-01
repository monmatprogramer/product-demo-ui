// src/App.js
import React, { useEffect, useState, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import NavbarBar from "./components/NavbarBar";
import Hero from "./components/Hero";
import Sidebar from "./components/Sidebar";
import SortControl from "./components/SortControl";
import ProductGrid from "./components/ProductGrid";
import ProductDetail from "./components/ProductDetail";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ProfilePage from "./components/ProfilePage";
import OrdersPage from "./components/OrdersPage";
import NotFound from "./components/NotFound";
import Loader from "./components/Loader";
import Footer from "./components/Footer";

import { getCart } from "./utils/cartUtils";
import { AuthProvider } from "./components/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import "./App.css";
import AdminPage from "./components/AdminPage";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./components/admin/Dashboard";
import ProductsAdmin from "./components/admin/ProductsAdmin";
import UserManagement from "./components/admin/UserManagement";
import Reports from "./components/admin/Reports";
import Analytics from "./components/admin/Analytics";
import MyComponent from './components/MyComponent';

// Mock product data to use when API fails
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

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("");
  const navigate = useNavigate();

  const cartCount = getCart().reduce((sum, p) => sum + p.qty, 0);

  useEffect(() => {
    // Fetch products from API or use mock data
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`API error: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        console.log("Fetched products:", data);
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          // If API returns empty or invalid data, use mock data
          console.log("Using mock product data");
          setProducts(MOCK_PRODUCTS);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        // Use mock data on error
        console.log("Using mock product data due to error");
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    // Safely create categories from products
    if (!Array.isArray(products) || products.length === 0) {
      return ["All"];
    }
    
    const setCats = new Set(["All"]);
    products.forEach((p) => {
      if (p && p.name) {
        const nameParts = p.name.split(" ");
        if (nameParts.length > 0) {
          const last = nameParts[nameParts.length - 1];
          setCats.add(last.endsWith("s") ? last : last + "s");
        }
      }
    });
    return Array.from(setCats);
  }, [products]);

  const filtered = useMemo(() => {
    // Guard against products not being an array
    if (!Array.isArray(products)) {
      return [];
    }
    
    let arr =
      category === "All"
        ? products
        : products.filter((p) => {
            if (p && p.name) {
              const nameParts = p.name.split(" ");
              if (nameParts.length > 0) {
                const last = nameParts[nameParts.length - 1];
                return (last.endsWith("s") ? last : last + "s") === category;
              }
            }
            return false;
          });
    
    if (query) {
      arr = arr.filter((p) =>
        p && p.name && p.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (sortOrder === "asc") arr.sort((a, b) => a.price - b.price);
    if (sortOrder === "desc") arr.sort((a, b) => b.price - a.price);
    
    return arr;
  }, [products, category, query, sortOrder]);

  if (loading) return <Loader />;

  return (
    <AuthProvider>
      <div className="app-container d-flex flex-column min-vh-100">
        <NavbarBar
          searchValue={query}
          onSearch={setQuery}
          cartCount={cartCount}
        />

        <main className="flex-grow-1">
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
                          onSelect={(c) => {
                            setCategory(c);
                            setSortOrder("");
                          }}
                        />
                      </Col>
                      <Col md={10}>
                        <SortControl
                          sortOrder={sortOrder}
                          onSortChange={setSortOrder}
                        />
                        <ProductGrid
                          products={filtered}
                          onViewDetails={(p) => {
                            localStorage.setItem("lastViewed", p.id);
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
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            ></Route>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
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
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
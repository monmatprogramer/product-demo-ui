import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { 
    FaChartLine, 
    FaChartBar, 
    FaChartPie, 
    FaChartArea,
    FaExclamationTriangle
} from 'react-icons/fa';
import { safeJsonFetch } from '../../utils/apiUtils';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState('month');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all necessary data for analytics
                const [products, users, orders] = await Promise.all([
                    safeJsonFetch('/api/products'),
                    safeJsonFetch('/api/users'),
                    safeJsonFetch('/api/orders')
                ]);
                
                const productsData = products || [];
                const usersData = users || [];
                const ordersData = orders || [];
                
                // Calculate sales from orders
                const sales = ordersData.reduce(
                    (sum, o) =>
                        sum + (o.total != null
                            ? o.total
                            : o.items ? o.items.reduce((acc, i) => acc + i.qty * i.price, 0) : 0),
                    0
                );
                
                // Prepare data for charts
                const processOrdersByDate = (orders) => {
                    const groupedOrders = {};
                    
                    // Group by appropriate time unit
                    orders.forEach(order => {
                        const date = new Date(order.date);
                        let key;
                        
                        if (timeFrame === 'day') {
                            key = date.toISOString().split('T')[0]; // YYYY-MM-DD
                        } else if (timeFrame === 'month') {
                            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                        } else if (timeFrame === 'year') {
                            key = `${date.getFullYear()}`; // YYYY
                        }
                        
                        if (!key) return;
                        
                        if (!groupedOrders[key]) {
                            groupedOrders[key] = {
                                date: key,
                                orders: 0,
                                sales: 0
                            };
                        }
                        
                        groupedOrders[key].orders += 1;
                        groupedOrders[key].sales += order.total || 
                            (order.items ? order.items.reduce((s, i) => s + i.qty * i.price, 0) : 0);
                    });
                    
                    // Convert to array and sort by date
                    return Object.values(groupedOrders).sort((a, b) => a.date.localeCompare(b.date));
                };
                
                // Process data for top products
                const processTopProducts = (orders) => {
                    const productSales = {};
                    
                    orders.forEach(order => {
                        if (!order.items) return;
                        
                        order.items.forEach(item => {
                            if (!productSales[item.id]) {
                                productSales[item.id] = {
                                    id: item.id,
                                    name: item.name,
                                    quantity: 0,
                                    revenue: 0
                                };
                            }
                            
                            productSales[item.id].quantity += item.qty;
                            productSales[item.id].revenue += item.qty * item.price;
                        });
                    });
                    
                    // Convert to array and sort by revenue
                    return Object.values(productSales)
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5); // Top 5
                };
                
                setData({
                    summary: {
                        products: productsData.length,
                        users: usersData.length,
                        orders: ordersData.length,
                        sales
                    },
                    salesOverTime: processOrdersByDate(ordersData),
                    topProducts: processTopProducts(ordersData)
                });
                
                setError(null);
            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError("Failed to load analytics data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [timeFrame]);

    if (loading) {
        return (
            <div className="loading-container">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <>
                <h2 className="admin-title">Analytics</h2>
                <Alert variant="danger" className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-2" />
                    {error}
                </Alert>
            </>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="admin-title mb-0">Analytics</h2>
                <Form.Select 
                    style={{ width: '180px' }}
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                >
                    <option value="day">Daily</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                </Form.Select>
            </div>
            
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <div className="chart-container h-100">
                        <h4 className="chart-title">
                            <FaChartLine className="me-2" />
                            Sales Trend
                        </h4>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            {/* This would be replaced with an actual chart component */}
                            <div className="text-muted">
                                Sales chart would render here using data from:
                                <br />
                                {data.salesOverTime.length > 0 ? (
                                    <code>data.salesOverTime = [{data.salesOverTime.length} items]</code>
                                ) : (
                                    <span>No sales data available</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={4}>
                    <div className="chart-container h-100">
                        <h4 className="chart-title">
                            <FaChartPie className="me-2" />
                            Customer Distribution
                        </h4>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            {/* This would be replaced with an actual chart component */}
                            <div className="text-muted">Customer pie chart would render here</div>
                        </div>
                    </div>
                </Col>
            </Row>
            
            <Row className="g-4">
                <Col lg={6}>
                    <div className="chart-container">
                        <h4 className="chart-title">
                            <FaChartBar className="me-2" />
                            Top Products
                        </h4>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
                            {/* This would be replaced with an actual chart component */}
                            <div className="text-muted">
                                Top products chart would render here using data from:
                                <br />
                                {data.topProducts.length > 0 ? (
                                    <code>data.topProducts = [{data.topProducts.length} items]</code>
                                ) : (
                                    <span>No product data available</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={6}>
                    <div className="chart-container">
                        <h4 className="chart-title">
                            <FaChartArea className="me-2" />
                            User Growth
                        </h4>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
                            {/* This would be replaced with an actual chart component */}
                            <div className="text-muted">User growth chart would render here</div>
                        </div>
                    </div>
                </Col>
            </Row>
        </>
    );
}
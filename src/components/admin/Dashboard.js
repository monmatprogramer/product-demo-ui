import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { 
    FaBox, 
    FaUsers, 
    FaShoppingCart, 
    FaDollarSign, 
    FaSync,
    FaChartLine,
    FaChartPie,
    FaChartBar
} from 'react-icons/fa';
import { safeJsonFetch } from '../../utils/apiUtils';
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

// Enhanced mock data for visualizations
const MOCK_DATA = {
    summary: {
        products: 8,
        users: 12,
        orders: 25,
        sales: 4259.97
    },
    salesTrend: [
        { month: 'Jan', sales: 1200 },
        { month: 'Feb', sales: 1900 },
        { month: 'Mar', sales: 800 },
        { month: 'Apr', sales: 1700 },
        { month: 'May', sales: 1500 },
        { month: 'Jun', sales: 2100 },
    ],
    topProducts: [
        { name: 'Gaming Laptop', sales: 3500 },
        { name: 'Mechanical Keyboard', sales: 2800 },
        { name: 'Wireless Mouse', sales: 1800 },
        { name: 'Ergonomic Chair', sales: 1200 },
        { name: 'LED Monitor', sales: 950 },
    ],
    orderStatus: [
        { name: 'Delivered', value: 63, color: '#28a745' },
        { name: 'Shipped', value: 27, color: '#17a2b8' },
        { name: 'Processing', value: 10, color: '#ffc107' },
    ],
    recentActivity: [
        { id: 1, type: 'order', text: 'New order #2752 ($129.99)', time: '5 minutes ago' },
        { id: 2, type: 'user', text: 'New user registration: james_wilson', time: '28 minutes ago' },
        { id: 3, type: 'product', text: 'Product "Wireless Headphones" is low in stock (2 remaining)', time: '1 hour ago' },
        { id: 4, type: 'order', text: 'Order #2751 changed status to Shipped', time: '3 hours ago' },
    ]
};

// Custom tooltip components for charts
const SalesToolTip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{ 
                backgroundColor: '#fff', 
                padding: '10px', 
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
                <p className="label" style={{ margin: 0 }}><strong>{payload[0].payload.month}</strong></p>
                <p style={{ margin: 0, color: '#0d6efd' }}>Sales: ${payload[0].value.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

const ProductToolTip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{ 
                backgroundColor: '#fff', 
                padding: '10px', 
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
                <p className="label" style={{ margin: 0 }}><strong>{payload[0].payload.name}</strong></p>
                <p style={{ margin: 0, color: '#0d6efd' }}>Revenue: ${payload[0].value.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);
    const [timeRange, setTimeRange] = useState('6months');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Create an array of promises but don't wait for all to complete
            const promises = [
                safeJsonFetch('/api/products').catch(() => null),
                safeJsonFetch('/api/users').catch(() => null),
                safeJsonFetch('/api/orders').catch(() => null)
            ];
            
            // Execute all promises in parallel
            const [products, users, orders] = await Promise.all(promises);
            
            // Check if we got valid data from all endpoints
            if (!products && !users && !orders) {
                console.log("All API calls failed, using mock data");
                setUsingMockData(true);
                setData(MOCK_DATA);
                return;
            }
            
            const productsData = products || [];
            const usersData = users || [];
            const ordersData = orders || [];
            
            // Calculate summary statistics
            const sales = ordersData.reduce(
                (sum, o) =>
                    sum + (o.total != null
                        ? o.total
                        : o.items ? o.items.reduce((acc, i) => acc + i.qty * i.price, 0) : 0),
                0
            );
            
            // Process sales trend data from orders
            const salesByMonth = {};
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            ordersData.forEach(order => {
                if (!order.date) return;
                
                const date = new Date(order.date);
                const monthIdx = date.getMonth();
                const monthName = months[monthIdx];
                
                if (!salesByMonth[monthName]) {
                    salesByMonth[monthName] = 0;
                }
                
                salesByMonth[monthName] += order.total || 
                    (order.items ? order.items.reduce((s, i) => s + i.qty * i.price, 0) : 0);
            });
            
            const salesTrend = Object.keys(salesByMonth).map(month => ({
                month,
                sales: salesByMonth[month]
            }));
            
            // Process top products
            const productSales = {};
            
            ordersData.forEach(order => {
                if (!order.items) return;
                
                order.items.forEach(item => {
                    if (!productSales[item.name]) {
                        productSales[item.name] = 0;
                    }
                    
                    productSales[item.name] += item.qty * item.price;
                });
            });
            
            const topProducts = Object.keys(productSales)
                .map(name => ({ name, sales: productSales[name] }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);
            
            // Process order status
            const statusCounts = {
                'Delivered': 0,
                'Shipped': 0,
                'Processing': 0
            };
            
            ordersData.forEach(order => {
                const status = order.status || 'Processing';
                if (statusCounts[status] !== undefined) {
                    statusCounts[status]++;
                }
            });
            
            const orderStatus = [
                { name: 'Delivered', value: statusCounts['Delivered'], color: '#28a745' },
                { name: 'Shipped', value: statusCounts['Shipped'], color: '#17a2b8' },
                { name: 'Processing', value: statusCounts['Processing'], color: '#ffc107' },
            ];
            
            // If we have no data, use mock data
            if (salesTrend.length === 0 && topProducts.length === 0 && orderStatus.every(s => s.value === 0)) {
                console.log("No visualization data available, using mock data for charts");
                setData({
                    summary: {
                        products: productsData.length,
                        users: usersData.length,
                        orders: ordersData.length,
                        sales
                    },
                    salesTrend: MOCK_DATA.salesTrend,
                    topProducts: MOCK_DATA.topProducts,
                    orderStatus: MOCK_DATA.orderStatus,
                    recentActivity: MOCK_DATA.recentActivity
                });
                setUsingMockData(true);
            } else {
                setData({
                    summary: {
                        products: productsData.length,
                        users: usersData.length,
                        orders: ordersData.length,
                        sales
                    },
                    salesTrend: salesTrend.length > 0 ? salesTrend : MOCK_DATA.salesTrend,
                    topProducts: topProducts.length > 0 ? topProducts : MOCK_DATA.topProducts,
                    orderStatus,
                    recentActivity: MOCK_DATA.recentActivity // We don't have real activity data
                });
                setUsingMockData(false);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data. Using sample data instead.");
            setUsingMockData(true);
            // Use mock data even on error
            setData(MOCK_DATA);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <Alert variant="danger">
                Failed to load dashboard data. Please refresh and try again.
            </Alert>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="admin-title">Dashboard</h2>
                <div className="d-flex align-items-center">
                    {usingMockData && (
                        <span className="text-warning me-3">
                            <small>Using demo data</small>
                        </span>
                    )}
                    <Form.Select 
                        style={{ width: '130px' }}
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="me-2"
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="1month">Last month</option>
                        <option value="3months">Last 3 months</option>
                        <option value="6months">Last 6 months</option>
                        <option value="1year">Last year</option>
                    </Form.Select>
                    <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={fetchData} 
                        title="Refresh data"
                    >
                        <FaSync className="me-1" /> Refresh
                    </button>
                </div>
            </div>
            
            {error && (
                <Alert variant="warning" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {/* Summary Cards */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon products-icon">
                            <FaBox />
                        </div>
                        <h3 className="stat-value">{data.summary.products}</h3>
                        <p className="stat-label">Products</p>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon users-icon">
                            <FaUsers />
                        </div>
                        <h3 className="stat-value">{data.summary.users}</h3>
                        <p className="stat-label">Users</p>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon orders-icon">
                            <FaShoppingCart />
                        </div>
                        <h3 className="stat-value">{data.summary.orders}</h3>
                        <p className="stat-label">Orders</p>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="stat-card">
                        <div className="stat-icon sales-icon">
                            <FaDollarSign />
                        </div>
                        <h3 className="stat-value">${data.summary.sales.toFixed(2)}</h3>
                        <p className="stat-label">Total Sales</p>
                    </Card>
                </Col>
            </Row>
            
            {/* Charts */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">
                                    <FaChartLine className="me-2 text-primary" />
                                    Sales Trend
                                </h5>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={data.salesTrend}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip content={<SalesToolTip />} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="sales" 
                                        name="Sales ($)" 
                                        stroke="#0d6efd" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6, stroke: '#0d6efd', strokeWidth: 2, fill: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">
                                    <FaChartPie className="me-2 text-primary" />
                                    Order Status
                                </h5>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.orderStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {data.orderStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row className="g-4">
                <Col lg={8}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">
                                    <FaChartBar className="me-2 text-primary" />
                                    Top Selling Products
                                </h5>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={data.topProducts}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<ProductToolTip />} />
                                    <Legend />
                                    <Bar 
                                        dataKey="sales" 
                                        name="Revenue ($)" 
                                        fill="#0d6efd" 
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0">Recent Activity</h5>
                            </div>
                            <div className="activity-timeline">
                                {data.recentActivity.map(activity => (
                                    <div key={activity.id} className="activity-item mb-3">
                                        <div className="d-flex">
                                            <div className="activity-icon me-3" style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: activity.type === 'order' 
                                                    ? 'rgba(25, 135, 84, 0.1)' 
                                                    : activity.type === 'user' 
                                                        ? 'rgba(13, 110, 253, 0.1)' 
                                                        : 'rgba(255, 193, 7, 0.1)',
                                                color: activity.type === 'order' 
                                                    ? '#198754' 
                                                    : activity.type === 'user' 
                                                        ? '#0d6efd' 
                                                        : '#ffc107'
                                            }}>
                                                {activity.type === 'order' && <FaShoppingCart />}
                                                {activity.type === 'user' && <FaUsers />}
                                                {activity.type === 'product' && <FaBox />}
                                            </div>
                                            <div>
                                                <p className="mb-0">{activity.text}</p>
                                                <small className="text-muted">{activity.time}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}
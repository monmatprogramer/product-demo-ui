// src/components/admin/Analytics.js - Removed unused import
import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { 
    FaChartLine, 
    FaChartBar, 
    FaChartPie, 
    FaChartArea,
    FaExclamationTriangle
} from 'react-icons/fa';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState('month');

    useEffect(() => {
        // src/components/admin/Analytics.js
        // Just modifying key parts to use mock data

        // Inside the fetchData function:
        const fetchData = async () => {
            setLoading(true);
            try {
                // Use mock data instead of API calls
                const mockData = {
                    summary: {
                        products: 8,
                        users: 12,
                        orders: 25,
                        sales: 4259.97
                    },
                    salesOverTime: [
                        { date: '2023-01', orders: 5, sales: 1200 },
                        { date: '2023-02', orders: 8, sales: 1900 },
                        { date: '2023-03', orders: 3, sales: 800 },
                        { date: '2023-04', orders: 7, sales: 1700 },
                        { date: '2023-05', orders: 6, sales: 1500 },
                        { date: '2023-06', orders: 9, sales: 2100 },
                    ],
                    topProducts: [
                        { id: 1, name: 'Gaming Laptop', quantity: 5, revenue: 9499.95 },
                        { id: 2, name: 'Mechanical Keyboard', quantity: 8, revenue: 1036.00 },
                        { id: 3, name: 'Wireless Mouse', quantity: 12, revenue: 540.00 },
                        { id: 4, name: 'LED Monitor', quantity: 4, revenue: 999.96 },
                        { id: 5, name: 'Gaming Headset', quantity: 6, revenue: 449.94 }
                    ]
                };
                
                // Store in localStorage for persistence
                localStorage.setItem('mockAnalytics', JSON.stringify(mockData));
                setData(mockData);
                setError(null);
            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError("Failed to load analytics data. Using sample data instead.");
                
                // Try to load from localStorage as fallback
                const storedData = localStorage.getItem('mockAnalytics');
                if (storedData) {
                    setData(JSON.parse(storedData));
                } else {
                    // If all else fails, use hardcoded fallback
                    setData({
                        summary: { products: 0, users: 0, orders: 0, sales: 0 },
                        salesOverTime: [],
                        topProducts: []
                    });
                }
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
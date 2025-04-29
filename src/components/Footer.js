import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
    FaFacebook, 
    FaTwitter, 
    FaInstagram, 
    FaLinkedin, 
    FaHeart, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt 
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <Container>
                <Row className="py-5">
                    <Col lg={4} md={6} className="mb-4 mb-lg-0">
                        <h5 className="footer-heading">Computer Store</h5>
                        <p className="footer-text">
                            Your one-stop destination for all computing needs. We offer the latest products
                            with exceptional service and competitive prices.
                        </p>
                        <div className="social-icons">
                            <a href="#" className="social-icon">
                                <FaFacebook />
                            </a>
                            <a href="#" className="social-icon">
                                <FaTwitter />
                            </a>
                            <a href="#" className="social-icon">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-icon">
                                <FaLinkedin />
                            </a>
                        </div>
                    </Col>
                    
                    <Col lg={2} md={6} className="mb-4 mb-lg-0">
                        <h5 className="footer-heading">Quick Links</h5>
                        <ul className="footer-links">
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/products">Products</Link>
                            </li>
                            <li>
                                <Link to="/cart">Cart</Link>
                            </li>
                            <li>
                                <Link to="/profile">My Account</Link>
                            </li>
                        </ul>
                    </Col>
                    
                    <Col lg={2} md={6} className="mb-4 mb-lg-0">
                        <h5 className="footer-heading">Categories</h5>
                        <ul className="footer-links">
                            <li>
                                <Link to="/?category=Laptops">Laptops</Link>
                            </li>
                            <li>
                                <Link to="/?category=Desktops">Desktops</Link>
                            </li>
                            <li>
                                <Link to="/?category=Accessories">Accessories</Link>
                            </li>
                            <li>
                                <Link to="/?category=Components">Components</Link>
                            </li>
                        </ul>
                    </Col>
                    
                    <Col lg={4} md={6}>
                        <h5 className="footer-heading">Contact Us</h5>
                        <ul className="footer-contact">
                            <li>
                                <FaMapMarkerAlt className="contact-icon" />
                                123 PP Street, Phnom Penh, 12201
                            </li>
                            <li>
                                <FaPhone className="contact-icon" />
                                +855 708 361 10
                            </li>
                            <li>
                                <FaEnvelope className="contact-icon" />
                                mat@computerstore.com
                            </li>
                        </ul>
                        
                        <div className="newsletter">
                            <h6>Subscribe to our newsletter</h6>
                            <div className="newsletter-form">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="newsletter-input" 
                                />
                                <button className="newsletter-button">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </Col>
                </Row>
                
                <div className="footer-bottom">
                    <div className="copyright">
                        &copy; {currentYear} Computer Store. All rights reserved.
                    </div>
                    <div className="footer-bottom-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/faq">FAQ</Link>
                    </div>
                    <div className="made-with">
                        Made with <FaHeart className="heart-icon" /> by ComputerStore Team
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
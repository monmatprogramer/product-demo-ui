import React, { useState, useContext, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { clearCart } from "../utils/cartUtils";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // Initial form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  // Pre-fill form with user data when component mounts
  useEffect(() => {
    if (user) {
      // Try to get additional profile info from localStorage
      const storedProfile = JSON.parse(
        localStorage.getItem("userProfile") || "{}"
      );

      setFormData({
        name: user.username || "",
        address: storedProfile.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    // pretend we call an API…
    clearCart();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="success">
          <Alert.Heading>Thank you for your purchase! 🎉</Alert.Heading>
          <p>Your order has been placed successfully.</p>
        </Alert>
        <Button variant="primary" onClick={() => navigate("/")}>
          Back to Store
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: "600px" }}>
      <h2>Checkout</h2>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <fieldset className="border p-3 mb-4">
          <legend className="float-none w-auto px-2">
            Shipping Information
          </legend>
          <Form.Group className="mb-3" controlId="shipName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              name="name"
              required
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Please enter your name.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="shipAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="address"
              required
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Please enter your address.
            </Form.Control.Feedback>
          </Form.Group>
        </fieldset>

        <fieldset className="border p-3 mb-4">
          <legend className="float-none w-auto px-2">Payment Details</legend>
          <Form.Group className="mb-3" controlId="cardNumber">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="text"
              name="card"
              required
              placeholder="•••• •••• •••• 1234"
              pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{4}"
            />
            <Form.Control.Feedback type="invalid">
              Enter a valid 16-digit card number.
            </Form.Control.Feedback>
          </Form.Group>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="expDate">
                <Form.Label>Expiry</Form.Label>
                <Form.Control
                  type="text"
                  name="expiry"
                  required
                  placeholder="MM/YY"
                  pattern="(0[1-9]|1[0-2])\/\d{2}"
                />
                <Form.Control.Feedback type="invalid">
                  Enter MM/YY format.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="cvc">
                <Form.Label>CVC</Form.Label>
                <Form.Control
                  type="text"
                  name="cvc"
                  required
                  placeholder="123"
                  pattern="\d{3}"
                />
                <Form.Control.Feedback type="invalid">
                  3-digit CVC required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </fieldset>
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Back to Cart
          </Button>
          <Button type="submit" variant="primary">
            Place Order
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CheckoutPage;

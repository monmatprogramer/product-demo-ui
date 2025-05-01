import React, { useState, useEffect } from "react";
import { Alert, Button } from "react-bootstrap";

/**
 * A component to display API errors with retry functionality
 */
const ApiErrorBoundary = ({
  error,
  onRetry,
  loading = false,
  children,
  noDataMessage = "No data available",
}) => {
  // Store whether data was ever available
  const [hadData, setHadData] = useState(false);

  // Check if we have data based on children
  useEffect(() => {
    if (React.Children.count(children) > 0) {
      setHadData(true);
    }
  }, [children]);

  // If there's an error, display it with retry button
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Data</Alert.Heading>
        <p>{error}</p>
        {onRetry && (
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-danger"
              onClick={onRetry}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Retry"}
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  // If no children and we never had data, show no data message
  if (React.Children.count(children) === 0 && !hadData && !loading) {
    return (
      <Alert variant="info">
        <p>{noDataMessage}</p>
        {onRetry && (
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-primary"
              onClick={onRetry}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  // Otherwise, render children
  return children;
};

export default ApiErrorBoundary;

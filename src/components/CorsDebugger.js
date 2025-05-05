// src/components/CorsDebugger.js
import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";

/**
 * A component for diagnosing and debugging CORS issues
 * This can be added to your application during development and removed for production
 */
const CorsDebugger = () => {
  const [debugResults, setDebugResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(
    "https://d1cpw418nlfxh1.cloudfront.net/api/products"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [testMode, setTestMode] = useState("cors");

  // Run a diagnostic test against the API
  const runDiagnostic = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setDebugResults(null);

    try {
      // Test 1: Direct CORS request
      const results = {
        timestamp: new Date().toISOString(),
        tests: [],
      };

      // Test the API with different modes
      const modes = ["cors", "no-cors", "same-origin"];
      for (const mode of modes) {
        if (testMode !== "all" && testMode !== mode) continue;

        try {
          console.log(`Testing API with mode: ${mode}`);
          const startTime = performance.now();

          const response = await fetch(apiUrl, {
            method: "GET",
            mode: mode,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            // Only include credentials for same-origin to avoid CORS preflight issues
            credentials: mode === "same-origin" ? "include" : "omit",
          });

          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);

          const result = {
            mode,
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            duration: `${duration}ms`,
          };

          // Try to get response body (may fail with no-cors)
          try {
            if (mode !== "no-cors") {
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                result.bodyPreview =
                  JSON.stringify(data).substring(0, 100) + "...";
                result.responseType = "JSON";
              } else {
                const text = await response.text();
                result.bodyPreview = text.substring(0, 100) + "...";
                result.responseType = "Text";
              }
            } else {
              result.bodyPreview = "Cannot access body with no-cors mode";
              result.responseType = "Opaque";
            }
          } catch (bodyError) {
            result.bodyError = bodyError.message;
          }

          // Get headers (may be restricted with no-cors)
          try {
            result.headers = {};
            response.headers.forEach((value, key) => {
              result.headers[key] = value;
            });
          } catch (headerError) {
            result.headerError = headerError.message;
          }

          results.tests.push(result);
        } catch (testError) {
          results.tests.push({
            mode,
            success: false,
            error: testError.message,
          });
        }
      }

      // Add environment information
      results.environment = {
        userAgent: navigator.userAgent,
        origin: window.location.origin,
        targetApi: apiUrl,
      };

      setDebugResults(results);
    } catch (error) {
      console.error("Error running CORS diagnostic:", error);
      setErrorMessage(`Error running diagnostic: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Try a custom solution
  const tryCustomSolution = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Import and use the corsUtils
      const { fetchWithCorsHandling } = await import("../utils/corsUtils");
      const endpoint = apiUrl.replace(/^.*\/api/, "");

      console.log(`Using fetchWithCorsHandling for endpoint: ${endpoint}`);
      const data = await fetchWithCorsHandling(endpoint);

      setDebugResults({
        timestamp: new Date().toISOString(),
        customSolution: true,
        success: true,
        data: data,
      });
    } catch (error) {
      console.error("Custom solution failed:", error);
      setErrorMessage(`Custom solution failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header as="h5">CORS Debugger</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>API URL to test</Form.Label>
              <Form.Control
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="Enter full API URL"
              />
              <Form.Text className="text-muted">
                Enter the full URL of the API endpoint you want to test
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Test Mode</Form.Label>
              <Form.Select
                value={testMode}
                onChange={(e) => setTestMode(e.target.value)}
              >
                <option value="cors">cors</option>
                <option value="no-cors">no-cors</option>
                <option value="same-origin">same-origin</option>
                <option value="all">all modes</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={runDiagnostic}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Testing...
                  </>
                ) : (
                  "Run CORS Test"
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={tryCustomSolution}
                disabled={isLoading}
              >
                Try Custom Solution
              </Button>
            </div>
          </Form>

          {errorMessage && (
            <Alert variant="danger" className="mt-3">
              {errorMessage}
            </Alert>
          )}

          {debugResults && (
            <div className="mt-4">
              <h6>
                Test Results (
                {new Date(debugResults.timestamp).toLocaleString()})
              </h6>

              {debugResults.customSolution ? (
                <Alert variant={debugResults.success ? "success" : "danger"}>
                  <Alert.Heading>
                    Custom Solution{" "}
                    {debugResults.success ? "Succeeded" : "Failed"}
                  </Alert.Heading>
                  {debugResults.success && (
                    <pre className="mt-3 p-2 bg-light">
                      {JSON.stringify(debugResults.data, null, 2)}
                    </pre>
                  )}
                </Alert>
              ) : (
                debugResults.tests.map((test, index) => (
                  <Alert
                    key={index}
                    variant={test.success ? "success" : "danger"}
                    className="mb-2"
                  >
                    <div className="d-flex justify-content-between">
                      <strong>Mode: {test.mode}</strong>
                      {test.duration && <span>Time: {test.duration}</span>}
                    </div>

                    {test.error ? (
                      <p className="mb-0 mt-2">Error: {test.error}</p>
                    ) : (
                      <>
                        <p className="mb-0 mt-2">
                          Status: {test.status} {test.statusText}
                        </p>
                        {test.responseType && (
                          <p className="mb-0">
                            Response Type: {test.responseType}
                          </p>
                        )}
                        {test.bodyPreview && (
                          <div className="mt-2">
                            <small>Response Preview:</small>
                            <pre className="p-2 bg-light">
                              {test.bodyPreview}
                            </pre>
                          </div>
                        )}

                        {test.headers &&
                          Object.keys(test.headers).length > 0 && (
                            <div className="mt-2">
                              <small>Headers:</small>
                              <ul className="mb-0">
                                {Object.entries(test.headers)
                                  .filter(
                                    ([key]) =>
                                      key
                                        .toLowerCase()
                                        .includes("access-control") ||
                                      key.toLowerCase().includes("content-type")
                                  )
                                  .map(([key, value]) => (
                                    <li key={key}>
                                      <code>
                                        {key}: {value}
                                      </code>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                      </>
                    )}
                  </Alert>
                ))
              )}

              <div className="mt-3 p-3 bg-light">
                <small>Environment:</small>
                <ul className="mb-0">
                  <li>Origin: {debugResults.environment?.origin}</li>
                  <li>Target API: {debugResults.environment?.targetApi}</li>
                  <li>User Agent: {debugResults.environment?.userAgent}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h6>Tips for solving CORS issues:</h6>
            <ol className="small">
              <li>
                Ensure the API server includes proper CORS headers, especially{" "}
                <code>Access-Control-Allow-Origin</code>
              </li>
              <li>
                For AWS Amplify, update your <code>amplify.yml</code> file with
                proper CORS headers
              </li>
              <li>
                Consider using a Lambda function as a proxy for your API if you
                can't modify the API server
              </li>
              <li>For AWS Amplify, use custom rules to proxy API requests</li>
              <li>
                Consider using your browser's CORS extensions for local
                development
              </li>
            </ol>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CorsDebugger;

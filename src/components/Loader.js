import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = () => (
    <div className="text-center py-5">
        <Spinner animation="border" /> Loading products…
    </div>
);

export default Loader;

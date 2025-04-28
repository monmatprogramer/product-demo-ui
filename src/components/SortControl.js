import React from 'react';
import { Form } from 'react-bootstrap';

const SortControl = ({ sortOrder, onSortChange }) => (
    <div className="d-flex justify-content-end align-items-center mb-3 sort-container">
        <Form.Label className="me-2 mb-0">Sort by price:</Form.Label>
        <Form.Select
            value={sortOrder}
            onChange={e => onSortChange(e.target.value)}
            className="sort-select"
        >
            <option value="">Default</option>
            <option value="asc">Low to High ↑</option>
            <option value="desc">High to Low ↓</option>
        </Form.Select>
    </div>
);

export default SortControl;

import React from 'react';
import { ListGroup } from 'react-bootstrap';

const Sidebar = ({ categories, selected, onSelect }) => (
    <ListGroup>
      {categories.map(cat => (
          <ListGroup.Item
              key={cat}
              action
              active={cat === selected}
              onClick={() => onSelect(cat)}
          >
            {cat}
          </ListGroup.Item>
      ))}
    </ListGroup>
);

export default Sidebar;

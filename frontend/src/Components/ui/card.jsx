// card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';
const Card = ({ title, content, footer, className = '' }) => {
  return (
    <div className={`custom-card ${className}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-content">{content}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
Card.propTypes = {
  title: PropTypes.string,
  content: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
};
Card.defaultProps = {
  title: '',
  footer: null,
  className: '',
};
export default Card;


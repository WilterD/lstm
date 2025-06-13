// card.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '' }) => {
  return <div className={`custom-card ${className}`}>{children}</div>;
};

const CardHeader = ({ children, className = '' }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className = '' }) => {
  return <h3 className={`card-title ${className}`}>{children}</h3>;
};

const CardDescription = ({ children, className = '' }) => {
  return <p className={`card-description ${className}`}>{children}</p>;
};

const CardContent = ({ children, className = '' }) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

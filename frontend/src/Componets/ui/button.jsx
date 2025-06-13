// Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';
const Button = ({ label, onClick, disabled = false, className = '' }) => {
  return (
    <button
      className={`custom-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
Button.defaultProps = {
    disabled: false,
    className: '',
    };
    export default Button;
    
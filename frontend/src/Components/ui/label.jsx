//label.jxs
import React from 'react';
import PropTypes from 'prop-types';
import './Label.css';
const Label = ({ text, htmlFor, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={`custom-label ${className}`}>
      {text}
    </label>
  );
};
Label.propTypes = {
  text: PropTypes.string.isRequired,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
};
Label.defaultProps = {
  htmlFor: '',
  className: '',
};
export default Label;

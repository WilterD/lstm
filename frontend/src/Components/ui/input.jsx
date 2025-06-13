//input.jsx
import React from 'react';
import { Input as AntdInput } from 'antd';
import PropTypes from 'prop-types';
import './input.css'; // Import the CSS file for styling
const Input = ({ value, onChange, placeholder, type = 'text', className = '', ...props }) => {
  return (
    <AntdInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={`custom-input ${className}`}
      {...props}
    />
  );
};
Input.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    className: PropTypes.string,
    };
    Input.defaultProps = {
        value: '',
        placeholder: '',
        type: 'text',
        className: '',
    };
export default Input;




// select.jxs
import React from 'react';
import PropTypes from 'prop-types';
import './Select.css';
const Select = ({ options, value, onChange, className = '' }) => {
  return (
    <select
      className={`custom-select ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
Select.defaultProps = {
  className: '',
};
export default Select;

        
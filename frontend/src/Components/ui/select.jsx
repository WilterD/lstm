import React from 'react';
import PropTypes from 'prop-types';  // <-- Importa al inicio

const SelectTrigger = ({ children }) => <div className="select-trigger">{children}</div>;
const SelectContent = ({ children }) => <div className="select-content">{children}</div>;
const SelectItem = ({ value, children }) => <div className="select-item" data-value={value}>{children}</div>;
const SelectValue = ({ value }) => <span className="select-value">{value}</span>;

const Select = ({ options = [], value, onChange, className = '' }) => {
  return (
    <select
      className={`custom-select ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(option => (
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

SelectTrigger.propTypes = {
  children: PropTypes.node.isRequired,
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
SelectTrigger.propTypes = {
  children: PropTypes.node.isRequired,
};
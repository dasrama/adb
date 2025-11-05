import React from 'react';
import PropTypes from 'prop-types';
import '../../App.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`button ${variant} ${className} ${disabled ? 'disabled' : ''}`}
    {...props}
  >
    {children}
  </button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'save', 'cancel', 'edit', 'delete']),
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};
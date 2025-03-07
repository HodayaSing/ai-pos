import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'accent';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  to?: string;
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  accent: 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50'
};

const Button = ({ children, variant = 'primary', to, onClick, className = '' }: ButtonProps) => {
  const baseStyles = 'px-6 py-2 rounded-md transition-colors';
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
};

export { Button };

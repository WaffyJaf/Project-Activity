import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`border rounded-lg shadow-sm p-4 bg-white ${className}`}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={`mb-2 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
);
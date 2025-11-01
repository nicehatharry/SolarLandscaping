// Reusable form input component with consistent styling and validation
import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  maxLength?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  error,
  maxLength,
}) => {
  const inputId = `input-${name}`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1">
      <label 
        htmlFor={inputId} 
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`
          px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors
          ${hasError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300'
          }
        `}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
      />
      
      {hasError && (
        <span 
          id={`${inputId}-error`}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};
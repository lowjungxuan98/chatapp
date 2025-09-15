import React from 'react';
import { FormFieldConfig } from '../../lib/types/form';

interface FormFieldProps {
  field: FormFieldConfig;
  value: string | number | boolean;
  error?: string;
  touched?: boolean;
  onChange: (name: string, value: string | number | boolean) => void;
  onBlur: (name: string) => void;
  disabled?: boolean;
}

export function FormField({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  disabled = false,
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = field.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    onChange(field.name, newValue);
  };

  const handleBlur = () => {
    onBlur(field.name);
  };

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-md text-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error && touched 
      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-400' 
      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
    }
    ${field.className || ''}
  `.trim().replace(/\s+/g, ' ');

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled || field.disabled}
            rows={field.rows || 3}
            className={baseInputClasses}
            autoComplete={field.autoComplete}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={typeof value === 'string' || typeof value === 'number' ? value : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            required={field.required}
            disabled={disabled || field.disabled}
            className={baseInputClasses}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={typeof value === 'boolean' ? value : false}
              onChange={handleChange}
              onBlur={handleBlur}
              required={field.required}
              disabled={disabled || field.disabled}
              className={`
                h-4 w-4 text-blue-600 border-gray-300 rounded
                focus:ring-blue-500 focus:ring-2
                disabled:cursor-not-allowed
                ${field.className || ''}
              `.trim().replace(/\s+/g, ' ')}
            />
            <label htmlFor={field.name} className="ml-2 text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required={field.required}
                  disabled={disabled || field.disabled}
                  className={`
                    h-4 w-4 text-blue-600 border-gray-300
                    focus:ring-blue-500 focus:ring-2
                    disabled:cursor-not-allowed
                    ${field.className || ''}
                  `.trim().replace(/\s+/g, ' ')}
                />
                <label htmlFor={`${field.name}-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={typeof value === 'string' || typeof value === 'number' ? value : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled || field.disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            pattern={field.pattern}
            className={baseInputClasses}
            autoComplete={field.autoComplete}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {field.type !== 'checkbox' && (
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {field.description && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
      
      {error && touched && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}


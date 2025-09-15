import { useState, useCallback } from 'react';
import { z } from 'zod';
import { FormConfig, FormState, UseFormReturn } from '../types/form';

export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  const initialData = config.fields.reduce((acc, field) => {
    (acc as Record<string, unknown>)[field.name] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {} as T);

  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isValid: false,
    touched: {},
  });

  const validateField = useCallback((name: string, value: string | number | boolean) => {
    try {
      // Validate the entire form data to get field-specific errors
      const testData = { ...formState.data, [name]: value };
      config.schema.parse(testData);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues.find(issue => 
          issue.path.length > 0 && issue.path[0] === name
        );
        return fieldError?.message || 'Invalid value';
      }
      return 'Validation error';
    }
  }, [config.schema, formState.data]);

  const validateForm = useCallback((data: T) => {
    try {
      config.schema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.reduce((acc: Record<string, string>, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);
      }
      return {};
    }
  }, [config.schema]);

  const handleChange = useCallback((name: string, value: string | number | boolean) => {
    setFormState(prev => {
      const newData = { ...prev.data, [name]: value };
      const fieldError = validateField(name, value);
      const newErrors = { ...prev.errors };
      
      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name];
      }

      const allErrors = validateForm(newData);
      const isValid = Object.keys(allErrors).length === 0;

      return {
        ...prev,
        data: newData,
        errors: prev.touched[name] ? newErrors : prev.errors,
        isValid,
      };
    });
  }, [validateField, validateForm]);

  const handleBlur = useCallback((name: string) => {
    setFormState(prev => {
      const currentValue = prev.data[name];
      const typedValue = typeof currentValue === 'string' || typeof currentValue === 'number' || typeof currentValue === 'boolean' 
        ? currentValue 
        : '';
      const fieldError = validateField(name, typedValue);
      const newErrors = { ...prev.errors };
      
      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name];
      }

      return {
        ...prev,
        errors: newErrors,
        touched: { ...prev.touched, [name]: true },
      };
    });
  }, [validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (config.disabled || formState.isSubmitting) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const validatedData = config.schema.parse(formState.data);
      await config.onSubmit(validatedData);
      
      if (config.resetOnSubmit) {
        setFormState({
          data: initialData,
          errors: {},
          isSubmitting: false,
          isValid: false,
          touched: {},
        });
      } else {
        setFormState(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.reduce((acc: Record<string, string>, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);

        setFormState(prev => ({
          ...prev,
          errors,
          isSubmitting: false,
          touched: Object.keys(errors).reduce((acc: Record<string, boolean>, key) => {
            acc[key] = true;
            return acc;
          }, {} as Record<string, boolean>),
        }));
      } else {
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        throw error;
      }
    }
  }, [config, formState.data, formState.isSubmitting, initialData]);

  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      isSubmitting: false,
      isValid: false,
      touched: {},
    });
  }, [initialData]);

  const setFieldValue = useCallback((name: string, value: string | number | boolean) => {
    handleChange(name, value);
  }, [handleChange]);

  const setFieldError = useCallback((name: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setFormState(prev => ({ ...prev, errors: {} }));
  }, []);

  return {
    formState,
    handleSubmit,
    handleChange,
    handleBlur,
    reset,
    setFieldValue,
    setFieldError,
    clearErrors,
  };
}

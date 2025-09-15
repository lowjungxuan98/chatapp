import { z } from 'zod';

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

export interface FormFieldOption {
  label: string;
  value: string | number;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormFieldOption[]; // For select, radio, checkbox
  rows?: number; // For textarea
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  description?: string;
  className?: string;
}

export interface FormConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  fields: FormFieldConfig[];
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  submitButtonText?: string;
  submitButtonClassName?: string;
  formClassName?: string;
  resetOnSubmit?: boolean;
  disabled?: boolean;
}

export interface FormState<T extends Record<string, unknown> = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<string, boolean>;
}

export interface UseFormReturn<T extends Record<string, unknown> = Record<string, unknown>> {
  formState: FormState<T>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleChange: (name: string, value: string | number | boolean) => void;
  handleBlur: (name: string) => void;
  reset: () => void;
  setFieldValue: (name: string, value: string | number | boolean) => void;
  setFieldError: (name: string, error: string) => void;
  clearErrors: () => void;
}

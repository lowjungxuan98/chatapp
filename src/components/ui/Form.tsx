import React from 'react';
import { FormConfig } from '../../lib/types/form';
import { useForm } from '../../lib/hooks/useForm';
import { FormField } from './FormField';
import { Button } from './Button';

interface FormProps<T extends Record<string, unknown>> {
  config: FormConfig<T>;
  className?: string;
}

export function Form<T extends Record<string, unknown>>({
  config,
  className = '',
}: FormProps<T>) {
  const {
    formState,
    handleSubmit,
    handleChange,
    handleBlur,
  } = useForm(config);

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${config.formClassName || ''} ${className}`.trim()}
      noValidate
    >
      {config.fields.map((field) => {
        const currentValue = formState.data[field.name];
        const typedValue = typeof currentValue === 'string' || typeof currentValue === 'number' || typeof currentValue === 'boolean'
          ? currentValue
          : (field.type === 'checkbox' ? false : '');

        return (
          <FormField
            key={field.name}
            field={field}
            value={typedValue}
            error={formState.errors[field.name]}
            touched={formState.touched[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={config.disabled || formState.isSubmitting}
          />
        );
      })}

      <div className="flex justify-center">
        <Button
          type="submit"
          loading={formState.isSubmitting}
          disabled={config.disabled || formState.isSubmitting || !formState.isValid}
          className={config.submitButtonClassName}
        >
          {config.submitButtonText || 'Submit'}
        </Button>
      </div>
    </form>
  );
}

// Export a simplified version for common use cases
export function SimpleForm<T extends Record<string, unknown>>(props: FormProps<T>) {
  return <Form {...props} />;
}


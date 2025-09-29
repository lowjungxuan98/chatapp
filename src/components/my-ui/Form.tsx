import React from 'react';
import { FormConfig } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/my-ui/FormField';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
      className={`space-y-6 ${config.formClassName || ''} ${className}`.trim()}
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
          disabled={config.disabled || formState.isSubmitting || !formState.isValid}
          className={config.submitButtonClassName}
        >
          {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

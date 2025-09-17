import React from 'react';
import { FormFieldConfig } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
  const handleChange = (newValue: string | number | boolean) => {
    onChange(field.name, newValue);
  };

  const handleBlur = () => {
    onBlur(field.name);
  };

  const hasError = error && touched;

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            name={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled || field.disabled}
            rows={field.rows || 3}
            className={cn(hasError && "border-destructive", field.className)}
            autoComplete={field.autoComplete}
          />
        );

      case 'select':
        return (
          <Select
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            onValueChange={(newValue) => handleChange(newValue)}
            disabled={disabled || field.disabled}
          >
            <SelectTrigger className={cn(hasError && "border-destructive", field.className)}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={typeof value === 'boolean' ? value : false}
              onCheckedChange={(checked) => handleChange(checked)}
              onBlur={handleBlur}
              disabled={disabled || field.disabled}
              className={cn(hasError && "border-destructive", field.className)}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-normal cursor-pointer"
            >
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            onValueChange={(newValue) => handleChange(newValue)}
            disabled={disabled || field.disabled}
            className={cn("space-y-2", field.className)}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(option.value)}
                  id={`${field.name}-${option.value}`}
                  className={cn(hasError && "border-destructive")}
                />
                <Label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return (
          <Input
            type={field.type}
            id={field.name}
            name={field.name}
            value={typeof value === 'string' || typeof value === 'number' ? value : ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled || field.disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            pattern={field.pattern}
            className={cn(hasError && "border-destructive", field.className)}
            autoComplete={field.autoComplete}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <Label htmlFor={field.name} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {renderField()}
      
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      
      {hasError && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

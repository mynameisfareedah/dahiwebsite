/**
 * Validation utilities for admin forms
 */

export const validators = {
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Enter a valid email address';
    return null;
  },

  required: (value, fieldName = 'This field') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value, length, fieldName = 'This field') => {
    if (value && value.length < length) {
      return `${fieldName} must be at least ${length} characters`;
    }
    return null;
  },

  maxLength: (value, length, fieldName = 'This field') => {
    if (value && value.length > length) {
      return `${fieldName} must not exceed ${length} characters`;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) return 'Enter a valid phone number';
    return null;
  },

  url: (value) => {
    if (!value) return 'URL is required';
    try {
      new URL(value);
      return null;
    } catch {
      return 'Enter a valid URL';
    }
  },

  number: (value) => {
    if (!value) return 'This field is required';
    if (isNaN(Number(value))) return 'Must be a valid number';
    return null;
  },

  minValue: (value, min) => {
    if (Number(value) < min) return `Must be at least ${min}`;
    return null;
  },

  maxValue: (value, max) => {
    if (Number(value) > max) return `Must not exceed ${max}`;
    return null;
  },
};

export function validateForm(values, rules) {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return errors;
}

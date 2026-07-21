import { describe, it, expect } from 'vitest';
import { newsletterSchema, contactSchema, volunteerSchema } from '../forms';

describe('Form Validation Schemas', () => {
  describe('newsletterSchema', () => {
    describe('email validation', () => {
      it('should validate valid email addresses', () => {
        const validator = newsletterSchema.email;
        expect(validator('user@example.com')).toBe(true);
        expect(validator('test.email+tag@example.co.uk')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        const validator = newsletterSchema.email;
        expect(validator('invalid')).toBe('Please enter a valid email address.');
        expect(validator('invalid@')).toBe('Please enter a valid email address.');
        expect(validator('@example.com')).toBe('Please enter a valid email address.');
        expect(validator('user@.com')).toBe('Please enter a valid email address.');
      });

      it('should reject empty email', () => {
        const validator = newsletterSchema.email;
        expect(validator('')).toBe('Please enter a valid email address.');
      });
    });
  });

  describe('contactSchema', () => {
    describe('name validation', () => {
      it('should validate names with 2+ characters', () => {
        const validator = contactSchema.name;
        expect(validator('Al')).toBe(true);
        expect(validator('John Doe')).toBe(true);
      });

      it('should reject names with less than 2 characters', () => {
        const validator = contactSchema.name;
        expect(validator('A')).toBe('Please enter your name.');
        expect(validator('')).toBe('Please enter your name.');
      });

      it('should trim whitespace', () => {
        const validator = contactSchema.name;
        expect(validator('  Al  ')).toBe(true);
      });
    });

    describe('email validation', () => {
      it('should validate valid email addresses', () => {
        const validator = contactSchema.email;
        expect(validator('contact@example.com')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        const validator = contactSchema.email;
        expect(validator('invalid')).toBe('Please enter a valid email address.');
      });
    });

    describe('message validation', () => {
      it('should validate messages with 10+ characters', () => {
        const validator = contactSchema.message;
        expect(validator('Hello world with more text')).toBe(true);
      });

      it('should reject messages with less than 10 characters', () => {
        const validator = contactSchema.message;
        expect(validator('Hi there')).toBe('Please share a little more detail.');
        expect(validator('')).toBe('Please share a little more detail.');
      });

      it('should trim whitespace', () => {
        const validator = contactSchema.message;
        expect(validator('  Hello world with more text  ')).toBe(true);
      });
    });
  });

  describe('volunteerSchema', () => {
    describe('name validation', () => {
      it('should validate names with 2+ characters', () => {
        const validator = volunteerSchema.name;
        expect(validator('Jo')).toBe(true);
        expect(validator('Jane Doe')).toBe(true);
      });

      it('should reject names with less than 2 characters', () => {
        const validator = volunteerSchema.name;
        expect(validator('J')).toBe('Please enter your name.');
      });
    });

    describe('email validation', () => {
      it('should validate valid emails', () => {
        const validator = volunteerSchema.email;
        expect(validator('volunteer@example.com')).toBe(true);
      });

      it('should reject invalid emails', () => {
        const validator = volunteerSchema.email;
        expect(validator('notanemail')).toBe('Please enter a valid email address.');
      });
    });

    describe('phone validation', () => {
      it('should validate phone numbers with 7+ characters', () => {
        const validator = volunteerSchema.phone;
        expect(validator('1234567')).toBe(true);
        expect(validator('+1 (555) 123-4567')).toBe(true);
      });

      it('should reject phone numbers with less than 7 characters', () => {
        const validator = volunteerSchema.phone;
        expect(validator('123456')).toBe('Please enter a valid phone number.');
        expect(validator('')).toBe('Please enter a valid phone number.');
      });
    });

    describe('message validation', () => {
      it('should validate messages with 10+ characters', () => {
        const validator = volunteerSchema.message;
        expect(validator('I want to volunteer for healthcare')).toBe(true);
      });

      it('should reject messages with less than 10 characters', () => {
        const validator = volunteerSchema.message;
        expect(validator('Help me')).toBe('Please tell us a bit more about yourself.');
      });
    });
  });
});

import { describe, test, expect } from 'vitest';
import { signInSchema, signUpSchema } from './auth';

describe('signInSchema', () => {
  test('accepts valid email and password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid email format', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Please enter a valid email');
    }
  });

  test('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Password is required');
    }
  });
});

describe('signUpSchema', () => {
  test('accepts valid sign-up data', () => {
    const result = signUpSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  test('rejects name shorter than 1 character', () => {
    const result = signUpSchema.safeParse({
      name: '',
      email: 'john@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  test('rejects password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Password must be at least 8 characters');
    }
  });
});

'use client';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPush, mockSignInEmail, mockSignInSocial } = vi.hoisted(() => {
  return {
    mockPush: vi.fn(),
    mockSignInEmail: vi.fn(),
    mockSignInSocial: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  signIn: {
    email: mockSignInEmail,
    social: mockSignInSocial,
  },
}));

vi.mock('@/components/auth/auth-template', () => ({
  AuthTemplate: ({
    form,
    socialLogin,
  }: {
    form: React.ReactNode;
    socialLogin: React.ReactNode;
  }) => (
    <div>
      {form}
      {socialLogin}
    </div>
  ),
}));

vi.mock('@/components/auth/sign-in-form', () => ({
  SignInForm: ({
    onSubmit,
  }: {
    onSubmit: (data: { email: string; password: string }) => Promise<void>;
  }) => (
    <button
      onClick={() =>
        onSubmit({
          email: 'user@example.com',
          password: 'password123',
        })
      }
      type="button"
    >
      Submit Sign In
    </button>
  ),
}));

vi.mock('@/components/auth/social-login-section', () => ({
  SocialLoginSection: ({ onGitHubClick }: { onGitHubClick: () => Promise<void> }) => (
    <button onClick={() => onGitHubClick()} type="button">
      Continue With GitHub
    </button>
  ),
}));

import { SignInPageClient } from './sign-in-page-client';

describe('SignInPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignInEmail.mockReset();
    mockSignInSocial.mockReset();
  });

  it('falls back to /dashboard for direct Cellar sign-in', async () => {
    mockSignInEmail.mockResolvedValue({
      data: {
        redirect: false,
        url: undefined,
      },
      error: null,
    });

    render(<SignInPageClient />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit Sign In' }));

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('passes callbackURL into email sign-in and follows the returned redirect target', async () => {
    mockSignInEmail.mockResolvedValue({
      data: {
        redirect: true,
        url: '/api/auth/oauth2/authorize',
      },
      error: null,
    });

    render(<SignInPageClient callbackURL="/api/auth/oauth2/authorize" />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit Sign In' }));

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
        callbackURL: '/api/auth/oauth2/authorize',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/api/auth/oauth2/authorize');
    expect(mockPush).not.toHaveBeenCalledWith('/dashboard');
  });

  it('passes callbackURL into GitHub social sign-in', async () => {
    mockSignInSocial.mockResolvedValue({
      data: {
        url: '/api/auth/oauth2/authorize',
      },
      error: null,
    });

    render(<SignInPageClient callbackURL="/api/auth/oauth2/authorize" />);

    fireEvent.click(screen.getByRole('button', { name: 'Continue With GitHub' }));

    await waitFor(() => {
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: '/api/auth/oauth2/authorize',
      });
    });
  });
});

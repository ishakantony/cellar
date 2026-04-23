'use client';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPush, mockSignUpEmail, mockSignInSocial, mockSearchParamsToString } = vi.hoisted(() => {
  return {
    mockPush: vi.fn(),
    mockSignUpEmail: vi.fn(),
    mockSignInSocial: vi.fn(),
    mockSearchParamsToString: vi.fn(() => ''),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    toString: mockSearchParamsToString,
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  signIn: {
    social: mockSignInSocial,
  },
  signUp: {
    email: mockSignUpEmail,
  },
}));

vi.mock('@/components/auth/auth-template', () => ({
  AuthTemplate: ({
    form,
    socialLogin,
    footerLinkHref,
  }: {
    form: React.ReactNode;
    socialLogin: React.ReactNode;
    footerLinkHref: string;
  }) => (
    <div>
      {form}
      {socialLogin}
      <a href={footerLinkHref}>Footer Link</a>
    </div>
  ),
}));

vi.mock('@/components/auth/sign-up-form', () => ({
  SignUpForm: ({
    onSubmit,
  }: {
    onSubmit: (data: { name: string; email: string; password: string }) => Promise<void>;
  }) => (
    <button
      onClick={() =>
        onSubmit({
          name: 'Test User',
          email: 'user@example.com',
          password: 'password123',
        })
      }
      type="button"
    >
      Submit Sign Up
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

import { SignUpPageClient } from './sign-up-page-client';

describe('SignUpPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignUpEmail.mockReset();
    mockSignInSocial.mockReset();
    mockSearchParamsToString.mockReset();
    mockSearchParamsToString.mockReturnValue('');
  });

  it('falls back to /dashboard for direct Cellar sign-up', async () => {
    mockSignUpEmail.mockResolvedValue({
      data: {
        url: undefined,
      },
      error: null,
    });

    render(<SignUpPageClient />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit Sign Up' }));

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('passes callbackURL into sign-up and returns to the relying party when present', async () => {
    mockSignUpEmail.mockResolvedValue({
      data: {
        url: undefined,
      },
      error: null,
    });

    render(<SignUpPageClient callbackURL="/api/auth/oauth2/authorize" />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit Sign Up' }));

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: 'Test User',
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

    render(<SignUpPageClient callbackURL="/api/auth/oauth2/authorize" />);

    fireEvent.click(screen.getByRole('button', { name: 'Continue With GitHub' }));

    await waitFor(() => {
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: '/api/auth/oauth2/authorize',
      });
    });
  });

  it('preserves signed OIDC query params when linking back to sign-in', () => {
    mockSearchParamsToString.mockReturnValue(
      'client_id=oidc-dummy-app&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fcallback&sig=test'
    );

    render(<SignUpPageClient />);

    expect(screen.getByRole('link', { name: 'Footer Link' })).toHaveAttribute(
      'href',
      '/sign-in?client_id=oidc-dummy-app&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fcallback&sig=test'
    );
  });
});

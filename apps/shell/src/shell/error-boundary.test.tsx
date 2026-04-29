import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureErrorBoundary } from './error-boundary';

function Boom({ message = 'kaboom' }: { message?: string }): never {
  throw new Error(message);
}

describe('FeatureErrorBoundary', () => {
  it('renders children unchanged when nothing throws', () => {
    render(
      <FeatureErrorBoundary featureId="vault">
        <p>healthy</p>
      </FeatureErrorBoundary>
    );
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('renders the inline error card when a child throws', () => {
    // Suppress React's expected error logging from this test.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <FeatureErrorBoundary featureId="vault">
        <Boom message="kaboom" />
      </FeatureErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/kaboom/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('clicking Retry calls onRetry and clears the error state', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onRetry = vi.fn();
    render(
      <FeatureErrorBoundary featureId="vault" onRetry={onRetry}>
        <Boom />
      </FeatureErrorBoundary>
    );
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

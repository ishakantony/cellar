import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JsonExplorerPage } from './json-explorer';

describe('JsonExplorerPage', () => {
  it('renders the JSON Explorer title', () => {
    render(<JsonExplorerPage />);
    expect(screen.getByRole('heading', { name: /json explorer/i })).toBeInTheDocument();
  });

  it('renders a placeholder "Under construction" body', () => {
    render(<JsonExplorerPage />);
    expect(screen.getByText(/under construction/i)).toBeInTheDocument();
  });
});

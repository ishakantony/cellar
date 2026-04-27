import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Card } from './card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('handles onClick events', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Content</Card>);
    const card = screen.getByText('Clickable Content');

    await userEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('works without onClick handler', async () => {
    render(<Card>Non-clickable Content</Card>);
    const card = screen.getByText('Non-clickable Content');

    // Should not throw when clicked
    await userEvent.click(card);

    expect(card).toBeInTheDocument();
  });

  it('renders complex children', () => {
    render(
      <Card>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </Card>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

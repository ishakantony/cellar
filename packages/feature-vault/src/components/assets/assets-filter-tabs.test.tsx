import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetsFilterTabs } from './assets-filter-tabs';

describe('AssetsFilterTabs', () => {
  it('renders an "All" tab and one tab per asset type', () => {
    render(<AssetsFilterTabs selectedType={null} onTypeChange={() => {}} />);
    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /snippets/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /prompts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /links/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /images/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /files/i })).toBeInTheDocument();
  });

  it('marks the "All" tab as selected when selectedType is null', () => {
    render(<AssetsFilterTabs selectedType={null} onTypeChange={() => {}} />);
    const allTab = screen.getByRole('tab', { name: /all/i });
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    const snippetsTab = screen.getByRole('tab', { name: /snippets/i });
    expect(snippetsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('marks the matching type tab as selected', () => {
    render(<AssetsFilterTabs selectedType="SNIPPET" onTypeChange={() => {}} />);
    const snippetsTab = screen.getByRole('tab', { name: /snippets/i });
    expect(snippetsTab).toHaveAttribute('aria-selected', 'true');

    const allTab = screen.getByRole('tab', { name: /all/i });
    expect(allTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTypeChange with the type value when a type tab is clicked', async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();
    render(<AssetsFilterTabs selectedType={null} onTypeChange={onTypeChange} />);

    await user.click(screen.getByRole('tab', { name: /prompts/i }));
    expect(onTypeChange).toHaveBeenCalledWith('PROMPT');
  });

  it('calls onTypeChange with null when the "All" tab is clicked', async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();
    render(<AssetsFilterTabs selectedType="SNIPPET" onTypeChange={onTypeChange} />);

    await user.click(screen.getByRole('tab', { name: /all/i }));
    expect(onTypeChange).toHaveBeenCalledWith(null);
  });

  it('exposes a tablist with an accessible label', () => {
    render(<AssetsFilterTabs selectedType={null} onTypeChange={() => {}} />);
    expect(screen.getByRole('tablist', { name: /filter assets by type/i })).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetForm } from './asset-form';
import userEvent from '@testing-library/user-event';

vi.mock('@/components/assets/snippet-editor', () => ({
  SnippetEditor: ({
    value,
    onChange,
    language,
    onLanguageChange,
  }: {
    value: string;
    onChange: (v: string) => void;
    language: string;
    onLanguageChange: (l: string) => void;
  }) => (
    <div>
      <select value={language} onChange={e => onLanguageChange(e.target.value)}>
        <option value={language}>{language}</option>
      </select>
      <textarea value={value} onChange={e => onChange(e.target.value)} />
    </div>
  ),
}));

describe('AssetForm', () => {
  it('renders create form with type selector', () => {
    render(<AssetForm mode="create" availableCollections={[]} onSubmit={vi.fn()} />);
    expect(screen.getByText('Snippet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Asset title')).toBeInTheDocument();
  });

  it('renders edit form with disabled type', () => {
    render(
      <AssetForm
        mode="edit"
        defaultValues={{ type: 'NOTE', title: 'My Note' }}
        availableCollections={[]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Note')).toBeInTheDocument();
  });

  it('shows snippet fields when snippet selected', () => {
    render(
      <AssetForm
        mode="create"
        defaultValues={{ type: 'SNIPPET' }}
        availableCollections={[]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows url field when link selected', () => {
    render(
      <AssetForm
        mode="create"
        defaultValues={{ type: 'LINK' }}
        availableCollections={[]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
  });

  it('submits with correct data', async () => {
    const onSubmit = vi.fn();
    render(
      <AssetForm
        mode="create"
        defaultValues={{ type: 'LINK' }}
        availableCollections={[]}
        onSubmit={onSubmit}
      />
    );

    const titleInput = screen.getByPlaceholderText('Asset title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'My Link');

    const urlInput = screen.getByPlaceholderText('https://example.com');
    await userEvent.type(urlInput, 'https://example.com/test');

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(onSubmit).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    const call = onSubmit.mock.calls[0][0];
    expect(call.title).toBe('My Link');
    expect(call.type).toBe('LINK');
    expect(call.url).toBe('https://example.com/test');
  });

  it('shows collection multiselect when collections available', () => {
    render(
      <AssetForm
        mode="create"
        availableCollections={[{ id: 'c1', name: 'Work' }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('Collections')).toBeInTheDocument();
  });
});

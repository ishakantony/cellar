import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadField } from './file-upload-field';

describe('FileUploadField', () => {
  it('renders dropzone when empty', () => {
    render(<FileUploadField value={null} onChange={vi.fn()} />);
    expect(screen.getByText(/drop a file here/i)).toBeInTheDocument();
  });

  it('renders file metadata when value provided', () => {
    render(
      <FileUploadField
        value={{
          filePath: 'test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
        }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('calls onChange with null when remove clicked', () => {
    const onChange = vi.fn();
    render(
      <FileUploadField
        value={{
          filePath: 'test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
        }}
        onChange={onChange}
      />
    );
    const removeButton = screen.getByText(/remove/i);
    fireEvent.click(removeButton);
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

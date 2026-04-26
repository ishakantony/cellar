import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { FileUploadField } from './file-upload-field';

const meta: Meta<typeof FileUploadField> = {
  title: 'Assets/FileUploadField',
  component: FileUploadField,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FileUploadField>;

export const Empty: Story = {
  args: {
    value: null,
  },
};

export const WithFile: Story = {
  args: {
    value: {
      filePath: 'user-123/document.pdf',
      fileName: 'document.pdf',
      mimeType: 'application/pdf',
      fileSize: 204800,
    },
  },
};

export const WithImage: Story = {
  args: {
    value: {
      filePath: 'user-123/photo.png',
      fileName: 'photo.png',
      mimeType: 'image/png',
      fileSize: 102400,
    },
  },
};

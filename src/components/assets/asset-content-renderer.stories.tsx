import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AssetContentRenderer } from './asset-content-renderer';
import { AssetType } from '@/generated/prisma/enums';

const meta: Meta<typeof AssetContentRenderer> = {
  title: 'Assets/AssetContentRenderer',
  component: AssetContentRenderer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AssetContentRenderer>;

const BASE_ASSET = {
  content: null,
  language: null,
  url: null,
  filePath: null,
  fileName: null,
  mimeType: null,
  fileSize: null,
};

export const Snippet: Story = {
  args: {
    asset: {
      ...BASE_ASSET,
      type: 'SNIPPET' as AssetType,
      content: 'function hello() {\n  return "world";\n}',
      language: 'javascript',
    },
  },
};

export const Prompt: Story = {
  args: {
    asset: {
      ...BASE_ASSET,
      type: 'PROMPT' as AssetType,
      content: '# System Prompt\n\nYou are a helpful assistant.',
    },
  },
};

export const Note: Story = {
  args: {
    asset: {
      ...BASE_ASSET,
      type: 'NOTE' as AssetType,
      content: '## Meeting Notes\n\n- Action item 1\n- Action item 2',
    },
  },
};

export const Link: Story = {
  args: {
    asset: {
      ...BASE_ASSET,
      type: 'LINK' as AssetType,
      url: 'https://example.com',
    },
  },
};

export const Image: Story = {
  args: {
    asset: {
      ...BASE_ASSET,
      type: 'IMAGE' as AssetType,
      filePath: 'user-123/test.png',
      fileName: 'test.png',
      mimeType: 'image/png',
      fileSize: 1024,
    },
  },
};

export const File: Story = {
  args: {
    asset: {
      ...BASE_ASSET,
      type: 'FILE' as AssetType,
      filePath: 'user-123/document.pdf',
      fileName: 'document.pdf',
      mimeType: 'application/pdf',
      fileSize: 204800,
    },
  },
};

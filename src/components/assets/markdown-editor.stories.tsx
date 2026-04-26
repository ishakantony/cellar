import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MarkdownEditor } from './markdown-editor';

const meta: Meta<typeof MarkdownEditor> = {
  title: 'Assets/MarkdownEditor',
  component: MarkdownEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MarkdownEditor>;

export const Default: Story = {
  args: {
    value: '# Hello World\n\nThis is **markdown** content.',
    onChange: () => {},
  },
};

export const Empty: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Start writing...',
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { TypeBadge } from './type-badge';

const meta: Meta<typeof TypeBadge> = {
  component: TypeBadge,
  title: 'UI/TypeBadge',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof TypeBadge>;

export const Snippet: Story = {
  args: { label: 'snippet', color: '#7882F5' },
};

export const Prompt: Story = {
  args: { label: 'prompt', color: '#F59E0B' },
};

export const Link: Story = {
  args: { label: 'link', color: '#06B6D4' },
};

export const Note: Story = {
  args: { label: 'note', color: '#A855F7' },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './avatar';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: 'UI/Avatar',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    src: { control: 'text' },
    name: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    name: 'Felix',
    size: 'md',
  },
};

export const WithInitial: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    name: 'Alice',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    name: 'Sarah',
    size: 'lg',
  },
};

export const VariousInitials: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <Avatar name="Alice" size="md" />
      <Avatar name="Bob" size="md" />
      <Avatar name="Charlie" size="md" />
      <Avatar name="Diana" size="md" />
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <Avatar name="User" size="sm" />
      <Avatar name="User" size="md" />
      <Avatar name="User" size="lg" />
    </div>
  ),
};

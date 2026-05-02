import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './kbd';

const meta: Meta<typeof Kbd> = {
  component: Kbd,
  title: 'UI/Kbd',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const CommandK: Story = {
  args: { children: '⌘K' },
};

export const Escape: Story = {
  args: { children: 'esc' },
};

export const Enter: Story = {
  args: { children: '↵' },
};

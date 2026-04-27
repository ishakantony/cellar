import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { X, Settings, Trash, Edit, MoreHorizontal } from 'lucide-react';
import { IconButton } from './icon-button';

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  title: 'UI/IconButton',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'danger', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    icon: Settings,
    variant: 'default',
    size: 'md',
    label: 'Settings',
    onClick: fn(),
  },
};

export const Danger: Story = {
  args: {
    icon: Trash,
    variant: 'danger',
    size: 'md',
    label: 'Delete',
    onClick: fn(),
  },
};

export const Ghost: Story = {
  args: {
    icon: MoreHorizontal,
    variant: 'ghost',
    size: 'md',
    label: 'More options',
    onClick: fn(),
  },
};

export const Small: Story = {
  args: {
    icon: X,
    variant: 'default',
    size: 'sm',
    label: 'Close',
    onClick: fn(),
  },
};

export const EditButton: Story = {
  args: {
    icon: Edit,
    variant: 'default',
    size: 'md',
    label: 'Edit',
    onClick: fn(),
  },
};

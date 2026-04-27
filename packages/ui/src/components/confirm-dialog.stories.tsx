import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ConfirmDialog } from './confirm-dialog';

const meta: Meta<typeof ConfirmDialog> = {
  component: ConfirmDialog,
  title: 'UI/ConfirmDialog',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed with this action?',
    confirmLabel: 'Confirm',
    variant: 'primary',
  },
};

export const DangerVariant: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    title: 'Delete Collection',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    variant: 'danger',
  },
};

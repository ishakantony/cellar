import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MoreHorizontal, Edit, Trash, Share, Copy } from 'lucide-react';
import { Button } from './button';
import { ActionMenu } from './action-menu';

const meta: Meta<typeof ActionMenu> = {
  component: ActionMenu,
  title: 'UI/ActionMenu',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] },
  },
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

const defaultItems = [
  { id: 'edit', label: 'Edit', icon: Edit, onClick: fn() },
  { id: 'copy', label: 'Copy', icon: Copy, onClick: fn() },
  { id: 'share', label: 'Share', icon: Share, onClick: fn() },
  { id: 'delete', label: 'Delete', icon: Trash, variant: 'danger' as const, onClick: fn() },
];

export const Default: Story = {
  args: {
    trigger: <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>,
    items: defaultItems,
    align: 'right',
  },
};

export const AlignLeft: Story = {
  args: {
    trigger: <Button variant="ghost" size="sm">Menu</Button>,
    items: defaultItems,
    align: 'left',
  },
};

export const SingleItem: Story = {
  args: {
    trigger: <Button variant="secondary" size="sm">Options</Button>,
    items: [
      { id: 'action', label: 'Perform Action', onClick: fn() },
    ],
    align: 'right',
  },
};

export const DangerOnly: Story = {
  args: {
    trigger: <Button variant="danger" size="sm">Delete Options</Button>,
    items: [
      { id: 'remove', label: 'Remove', icon: Trash, variant: 'danger', onClick: fn() },
      { id: 'purge', label: 'Purge All', icon: Trash, variant: 'danger', onClick: fn() },
    ],
    align: 'right',
  },
};

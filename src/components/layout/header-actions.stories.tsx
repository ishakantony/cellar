import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { HeaderActions } from './header-actions';

const meta: Meta<typeof HeaderActions> = {
  component: HeaderActions,
  title: 'Layout/HeaderActions',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HeaderActions>;

export const Default: Story = {
  args: {
    onAddCollection: fn(),
    onAddItem: fn(),
    collectionLabel: 'Collection',
    itemLabel: 'Add Item',
  },
};

export const CustomLabels: Story = {
  args: {
    onAddCollection: fn(),
    onAddItem: fn(),
    collectionLabel: 'New Collection',
    itemLabel: 'Create Item',
  },
};

export const Loading: Story = {
  args: {
    onAddCollection: fn(),
    onAddItem: fn(),
    collectionLabel: 'Collection',
    itemLabel: 'Add Item',
    loading: true,
  },
};

export const CollectionClickable: Story = {
  args: {
    onAddCollection: fn(),
    onAddItem: fn(),
    collectionLabel: 'Collection',
    itemLabel: 'Add Item',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    // Collection button is first in both desktop and mobile views
    await userEvent.click(buttons[0]);
    expect(args.onAddCollection).toHaveBeenCalled();
  },
};

export const AddItemClickable: Story = {
  args: {
    onAddCollection: fn(),
    onAddItem: fn(),
    collectionLabel: 'Collection',
    itemLabel: 'Add Item',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    // Add Item button is second in both desktop and mobile views
    await userEvent.click(buttons[1]);
    expect(args.onAddItem).toHaveBeenCalled();
  },
};

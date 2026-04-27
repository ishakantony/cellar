import type { Meta, StoryObj } from '@storybook/react-vite';
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
    collectionLabel: 'Collection',
  },
};

export const CustomLabels: Story = {
  args: {
    onAddCollection: fn(),
    collectionLabel: 'New Collection',
  },
};

export const Loading: Story = {
  args: {
    onAddCollection: fn(),
    collectionLabel: 'Collection',
    loading: true,
  },
};

export const CollectionClickable: Story = {
  args: {
    onAddCollection: fn(),
    collectionLabel: 'Collection',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    // Collection button
    await userEvent.click(buttons[0]);
    expect(args.onAddCollection).toHaveBeenCalled();
  },
};

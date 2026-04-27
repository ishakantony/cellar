import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CollectionCard } from './collection-card';

const meta: Meta<typeof CollectionCard> = {
  component: CollectionCard,
  title: 'Collections/CollectionCard',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof CollectionCard>;

const baseCollection = {
  id: '1',
  name: 'Design Resources',
  description: 'UI kits, icons, and mockups',
  color: '#3b82f6',
  pinned: false,
  _count: { assets: 12 },
};

export const Grid: Story = {
  args: {
    collection: baseCollection,
    layout: 'grid',
    onClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const List: Story = {
  args: {
    collection: baseCollection,
    layout: 'list',
    onClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const Pinned: Story = {
  args: {
    collection: { ...baseCollection, pinned: true },
    layout: 'grid',
    onClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const WithLongName: Story = {
  args: {
    collection: {
      ...baseCollection,
      name: 'This is a very long collection name that should truncate nicely',
    },
    layout: 'grid',
    onClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

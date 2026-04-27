import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CollectionsView } from './collections-view';

const meta: Meta<typeof CollectionsView> = {
  component: CollectionsView,
  title: 'Collections/CollectionsView',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof CollectionsView>;

const mockCollections = [
  {
    id: '1',
    name: 'Design',
    description: 'UI kits',
    color: '#3b82f6',
    pinned: true,
    _count: { assets: 5 },
  },
  {
    id: '2',
    name: 'Code Snippets',
    description: 'React hooks',
    color: '#10b981',
    pinned: false,
    _count: { assets: 12 },
  },
  {
    id: '3',
    name: 'Inspiration',
    description: null,
    color: '#f59e0b',
    pinned: false,
    _count: { assets: 8 },
  },
];

export const GridView: Story = {
  args: {
    collections: mockCollections,
    view: 'grid',
    onCardClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const ListView: Story = {
  args: {
    collections: mockCollections,
    view: 'list',
    onCardClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const Empty: Story = {
  args: {
    collections: [],
    view: 'grid',
    onCardClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const ManyItems: Story = {
  args: {
    collections: Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      name: `Collection ${i + 1}`,
      description: i % 3 === 0 ? 'Some description' : null,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4],
      pinned: i < 2,
      _count: { assets: i * 3 + 1 },
    })),
    view: 'grid',
    onCardClick: fn(),
    onTogglePin: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AssetsView } from './assets-view';
import { AssetType } from '@cellar/shared';

const meta: Meta<typeof AssetsView> = {
  title: 'Assets/AssetsView',
  component: AssetsView,
  tags: ['autodocs'],
  args: {
    onCardClick: fn(),
    onTogglePin: fn(),
    onDelete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AssetsView>;

const MOCK_ASSETS = [
  {
    id: '1',
    type: 'SNIPPET' as AssetType,
    title: 'Auth Helper',
    language: 'typescript',
    pinned: true,
    updatedAt: new Date(),
  },
  {
    id: '2',
    type: 'NOTE' as AssetType,
    title: 'Meeting Notes',
    language: null,
    pinned: false,
    updatedAt: new Date(),
  },
  {
    id: '3',
    type: 'LINK' as AssetType,
    title: 'Design System',
    language: null,
    pinned: false,
    updatedAt: new Date(),
  },
];

export const Grid: Story = {
  args: {
    assets: MOCK_ASSETS,
    view: 'grid',
    emptyMessage: 'No assets',
  },
};

export const List: Story = {
  args: {
    assets: MOCK_ASSETS,
    view: 'list',
    emptyMessage: 'No assets',
  },
};

export const Empty: Story = {
  args: {
    assets: [],
    view: 'grid',
    emptyMessage: 'No assets yet.',
  },
};

export const Loading: Story = {
  args: {
    assets: [],
    view: 'grid',
    emptyMessage: 'No assets',
    loading: true,
  },
};

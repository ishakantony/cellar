import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { AssetsToolbar } from './assets-toolbar';

const meta: Meta<typeof AssetsToolbar> = {
  title: 'Assets/AssetsToolbar',
  component: AssetsToolbar,
  tags: ['autodocs'],
  args: {
    onSearchChange: fn(),
    onTypeChange: fn(),
    onSortChange: fn(),
    onViewChange: fn(),
    onNewAsset: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AssetsToolbar>;

export const Default: Story = {
  args: {
    searchQuery: '',
    selectedType: null,
    sort: 'newest',
    viewMode: 'grid',
  },
};

export const WithSearch: Story = {
  args: {
    searchQuery: 'project',
    selectedType: null,
    sort: 'newest',
    viewMode: 'list',
  },
};

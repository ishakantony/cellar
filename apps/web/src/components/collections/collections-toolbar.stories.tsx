import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CollectionsToolbar } from './collections-toolbar';

const meta: Meta<typeof CollectionsToolbar> = {
  component: CollectionsToolbar,
  title: 'Collections/CollectionsToolbar',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof CollectionsToolbar>;

export const Default: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    view: 'grid',
    onViewChange: fn(),
    onNewCollection: fn(),
  },
};

export const WithSearchQuery: Story = {
  args: {
    searchValue: 'Design',
    onSearchChange: fn(),
    view: 'grid',
    onViewChange: fn(),
    onNewCollection: fn(),
  },
};

export const ListViewSelected: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    view: 'list',
    onViewChange: fn(),
    onNewCollection: fn(),
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { EmptyState } from './empty-state';

const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  title: 'UI/EmptyState',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    message: 'No items found',
  },
};

export const WithAction: Story = {
  args: {
    message: 'You have no collections yet',
    action: {
      label: 'Create Collection',
      onClick: fn(),
    },
  },
};

export const LongMessage: Story = {
  args: {
    message:
      'There are no results matching your search criteria. Try adjusting your filters or search terms.',
    action: {
      label: 'Clear Filters',
      onClick: fn(),
    },
  },
};

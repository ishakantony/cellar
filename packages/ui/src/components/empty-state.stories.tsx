import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { EmptyState } from './empty-state';
import { TextLink } from './text-link';

const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  title: 'UI/EmptyState',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    message: 'No items found',
  },
};

export const WithLink: Story = {
  args: {
    message: (
      <>
        No assets yet. <TextLink href="/assets/new">Create</TextLink> your first asset to get
        started.
      </>
    ),
  },
};

export const WithButton: Story = {
  args: {
    message: (
      <>
        No collections yet. <TextLink onClick={fn()}>Create</TextLink> your first collection to get
        started.
      </>
    ),
  },
};

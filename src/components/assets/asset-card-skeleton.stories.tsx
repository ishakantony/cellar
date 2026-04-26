import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AssetCardSkeleton } from './asset-card-skeleton';

const meta: Meta<typeof AssetCardSkeleton> = {
  title: 'Assets/AssetCardSkeleton',
  component: AssetCardSkeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AssetCardSkeleton>;

export const Full: Story = {};

export const Compact: Story = {
  args: {
    compact: true,
  },
};

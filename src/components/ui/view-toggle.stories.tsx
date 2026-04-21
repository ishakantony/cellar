import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ViewToggle } from './view-toggle';

const meta: Meta<typeof ViewToggle> = {
  component: ViewToggle,
  title: 'UI/ViewToggle',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ViewToggle>;

export const GridSelected: Story = {
  args: {
    view: 'grid',
    onChange: fn(),
  },
};

export const ListSelected: Story = {
  args: {
    view: 'list',
    onChange: fn(),
  },
};

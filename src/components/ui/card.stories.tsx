import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from './card';

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'UI/Card',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    hoverable: { control: 'boolean' },
    padding: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Card Title</h3>
        <p className="text-xs text-outline mt-1">This is the card content.</p>
      </div>
    ),
    padding: 'md',
  },
};

export const Hoverable: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Clickable Card</h3>
        <p className="text-xs text-outline mt-1">Hover over this card to see the effect.</p>
      </div>
    ),
    hoverable: true,
    padding: 'md',
  },
};

export const SmallPadding: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-xs font-semibold text-slate-100">Small Padding</h3>
      </div>
    ),
    padding: 'sm',
  },
};

export const LargePadding: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Large Padding</h3>
        <p className="text-xs text-outline mt-1">This card has more internal spacing.</p>
      </div>
    ),
    padding: 'lg',
  },
};

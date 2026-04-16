import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { within, userEvent } from 'storybook/test';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Button' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Button' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Button' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Button' },
};

export const Small: Story = {
  args: { variant: 'primary', size: 'sm', children: 'Button' },
};

export const Large: Story = {
  args: { variant: 'primary', size: 'lg', children: 'Button' },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true, children: 'Button' },
};

export const Loading: Story = {
  args: { variant: 'primary', loading: true, children: 'Button' },
};

export const Clickable: Story = {
  args: { variant: 'primary', children: 'Button', onClick: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Button/i });
    await userEvent.click(button);
  },
};

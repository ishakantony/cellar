import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './label';

const meta: Meta<typeof Label> = {
  component: Label,
  title: 'UI/Label',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    htmlFor: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Email Address',
  },
};

export const WithHtmlFor: Story = {
  args: {
    children: 'Username',
    htmlFor: 'username-input',
  },
};

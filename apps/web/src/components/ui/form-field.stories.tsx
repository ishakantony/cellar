import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FormField } from './form-field';
import { Input } from './input';

const meta: Meta<typeof FormField> = {
  component: FormField,
  title: 'UI/FormField',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Email',
    children: <Input value="" onChange={fn()} placeholder="you@example.com" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Please enter a valid email',
    children: <Input value="invalid" onChange={fn()} error="Please enter a valid email" />,
  },
};

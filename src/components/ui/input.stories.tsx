import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'UI/Input',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'url'] },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: 'text',
    value: '',
    onChange: fn(),
    placeholder: 'Enter text...',
    disabled: false,
  },
};

export const WithValue: Story = {
  args: {
    type: 'text',
    value: 'Hello World',
    onChange: fn(),
    placeholder: 'Enter text...',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    type: 'text',
    value: 'Cannot edit this',
    onChange: fn(),
    placeholder: 'Enter text...',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    type: 'email',
    value: 'invalid-email',
    onChange: fn(),
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    value: '',
    onChange: fn(),
    placeholder: 'user@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    value: 'secret123',
    onChange: fn(),
    placeholder: 'Enter password',
  },
};

export const Url: Story = {
  args: {
    type: 'url',
    value: '',
    onChange: fn(),
    placeholder: 'https://example.com',
  },
};

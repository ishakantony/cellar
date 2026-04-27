import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Some multiline content here.',
  },
};

export const WithError: Story = {
  args: {
    value: '',
    error: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    value: 'Read only',
    disabled: true,
  },
};

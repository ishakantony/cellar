import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './divider';

const meta = {
  title: 'UI/Divider',
  component: Divider,
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithText: Story = {
  args: {
    text: 'or',
  },
};

export const CustomText: Story = {
  args: {
    text: 'AND',
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  component: Separator,
  title: 'UI/Separator',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  decorators: [
    Story => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  decorators: [
    Story => (
      <div className="h-20 flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

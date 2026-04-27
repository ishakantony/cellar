import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComingSoon } from './coming-soon';

const meta: Meta<typeof ComingSoon> = {
  component: ComingSoon,
  title: 'Components/ComingSoon',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ComingSoon>;

export const Default: Story = {
  args: {
    title: 'Coming Soon',
    message: "We're working on something awesome! Stay tuned.",
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'New Feature Coming Soon',
    message: "We're building something amazing for you!",
  },
};

export const CustomMessage: Story = {
  args: {
    title: 'Under Construction',
    message: 'This feature is currently being developed. Check back later!',
  },
};

export const FullPage: Story = {
  args: {
    title: 'Coming Soon',
    message: "We're working on something awesome! Stay tuned.",
    className: 'min-h-screen',
  },
};

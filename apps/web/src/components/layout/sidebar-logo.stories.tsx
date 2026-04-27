import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { SidebarLogo } from './sidebar-logo';

const meta: Meta<typeof SidebarLogo> = {
  component: SidebarLogo,
  title: 'Layout/SidebarLogo',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarLogo>;

export const Default: Story = {
  args: {},
};

export const DisplaysLogoAndBrand: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Cellar')).toBeInTheDocument();
    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('.bg-primary-container')).toBeInTheDocument();
  },
};

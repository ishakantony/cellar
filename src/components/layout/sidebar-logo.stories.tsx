import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { SidebarLogo } from './sidebar-logo';

const meta: Meta<typeof SidebarLogo> = {
  component: SidebarLogo,
  title: 'Layout/SidebarLogo',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    showToggle: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarLogo>;

export const Default: Story = {
  args: {
    onToggle: fn(),
    showToggle: true,
  },
};

export const WithoutToggle: Story = {
  args: {
    onToggle: fn(),
    showToggle: false,
  },
};

export const MobileHiddenToggle: Story = {
  args: {
    onToggle: fn(),
    showToggle: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const InteractiveToggle: Story = {
  args: {
    onToggle: fn(),
    showToggle: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByRole('button');
    await userEvent.click(toggleButton);
    expect(args.onToggle).toHaveBeenCalled();
  },
};

export const WithoutToggleInteraction: Story = {
  args: {
    onToggle: fn(),
    showToggle: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const logo = canvas.getByText('Cellar');
    expect(logo).toBeInTheDocument();
    const button = canvas.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  },
};

export const DisplaysLogoAndBrand: Story = {
  args: {
    onToggle: fn(),
    showToggle: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Brand name should be present
    expect(canvas.getByText('Cellar')).toBeInTheDocument();
    // Logo icon container should be present (the rounded container with bg-primary-container)
    expect(document.querySelector('.bg-primary-container')).toBeInTheDocument();
  },
};

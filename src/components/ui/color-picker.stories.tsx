import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ColorPicker, DEFAULT_COLOR_OPTIONS } from './color-picker';

const meta: Meta<typeof ColorPicker> = {
  component: ColorPicker,
  title: 'UI/ColorPicker',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  args: {
    value: '#3b82f6',
    onChange: fn(),
    options: DEFAULT_COLOR_OPTIONS,
  },
};

export const Selected: Story = {
  args: {
    value: '#a855f7',
    onChange: fn(),
    options: DEFAULT_COLOR_OPTIONS,
  },
};

export const CustomOptions: Story = {
  args: {
    value: '#ff0000',
    onChange: fn(),
    options: [
      { value: '#ff0000', label: 'Red' },
      { value: '#00ff00', label: 'Green' },
      { value: '#0000ff', label: 'Blue' },
    ],
  },
};

export const Interactive: Story = {
  args: {
    onChange: fn(),
    options: DEFAULT_COLOR_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const limeButton = canvas.getByLabelText('Lime');
    await userEvent.click(limeButton);
    expect(args.onChange).toHaveBeenCalledWith('#84cc16');
    const pinkButton = canvas.getByLabelText('Pink');
    await userEvent.click(pinkButton);
    expect(args.onChange).toHaveBeenCalledWith('#ec4899');
  },
};

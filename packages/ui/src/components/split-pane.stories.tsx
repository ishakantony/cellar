import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitPane } from './split-pane';

const meta: Meta<typeof SplitPane> = {
  component: SplitPane,
  title: 'UI/SplitPane',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className="h-[480px] w-full bg-surface-container-lowest">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    defaultRatio: { control: { type: 'number', min: 0.1, max: 0.9, step: 0.05 } },
    minRatio: { control: { type: 'number', min: 0.05, max: 0.45, step: 0.05 } },
    maxRatio: { control: { type: 'number', min: 0.55, max: 0.95, step: 0.05 } },
  },
};

export default meta;
type Story = StoryObj<typeof SplitPane>;

const PaneContent = ({ label }: { label: string }) => (
  <div className="h-full p-4 text-xs text-outline">
    <div className="font-semibold text-on-surface">{label}</div>
    <p className="mt-2">Drag the divider to resize.</p>
  </div>
);

export const Default: Story = {
  args: {
    defaultRatio: 0.4,
    left: <PaneContent label="Left" />,
    right: <PaneContent label="Right" />,
  },
};

export const Persistent: Story = {
  args: {
    defaultRatio: 0.4,
    persistKey: 'storybook:split-pane:demo',
    left: <PaneContent label="Persisted Left" />,
    right: <PaneContent label="Persisted Right" />,
  },
};

export const NarrowBounds: Story = {
  args: {
    defaultRatio: 0.5,
    minRatio: 0.3,
    maxRatio: 0.7,
    left: <PaneContent label="Bounded Left" />,
    right: <PaneContent label="Bounded Right" />,
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeader } from './section-header';

const meta: Meta<typeof SectionHeader> = {
  component: SectionHeader,
  title: 'UI/SectionHeader',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const TitleOnly: Story = {
  args: { title: 'Workspace' },
};

export const WithCount: Story = {
  args: { title: 'Pinned', count: 4 },
};

export const WithAction: Story = {
  args: { title: 'Recently accessed', action: 'View all' },
};

export const Full: Story = {
  args: { title: 'Pinned', count: 4, action: 'View all' },
};

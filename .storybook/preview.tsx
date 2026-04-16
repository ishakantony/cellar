import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';  // Tailwind CSS
import React from 'react';

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="bg-[#0f172a] min-h-screen">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,  // Required for next/navigation
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'cellar-dark',
      values: [
        {
          name: 'cellar-dark',
          value: '#0f172a',
        },
      ],
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;

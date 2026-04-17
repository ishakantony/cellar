import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css'; // Tailwind CSS
import { ThemedDocsContainer } from './ThemedDocsContainer';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      // Apply theme-based background to story canvas
      const themeId = context.globals.theme || 'dark';
      const isDark = themeId === 'dark';

      return (
        <div
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            padding: '20px',
            minHeight: '100%',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    nextjs: {
      appDirectory: true, // Required for next/navigation
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
      test: 'todo',
    },
    docs: {
      container: ThemedDocsContainer,
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
      },
    },
  },
};

export default preview;

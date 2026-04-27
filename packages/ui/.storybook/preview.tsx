import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import '../src/styles.css';
import { ThemedDocsContainer } from './ThemedDocsContainer';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const themeId = context.globals.theme || 'dark';
      const isDark = themeId === 'dark';
      return (
        <MemoryRouter>
          <div
            style={{
              backgroundColor: isDark ? '#0a0e14' : '#ffffff',
              padding: '20px',
              minHeight: '100%',
            }}
          >
            <Story />
          </div>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
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
          value: '#0a0e14',
        },
      ],
    },
    a11y: {
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

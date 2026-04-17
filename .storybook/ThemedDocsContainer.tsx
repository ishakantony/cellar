import { DocsContainer } from '@storybook/addon-docs/blocks';
import type { DocsContextProps } from 'storybook/internal/types';
import type { ReactNode } from 'react';
import { create } from 'storybook/theming';

const createCellarTheme = (base: 'dark' | 'light' = 'dark') => {
  return create({
    base,

    brandTitle: 'Cellar',
    brandUrl: '/',
    brandImage: '/cellar-logo.svg',
    brandTarget: '_self',

    colorPrimary: '#6366f1',
    colorSecondary: '#94a3b8',

    // These are the key properties for autodocs background
    appBg: '#0f172a',
    appContentBg: '#1e293b', // This is the autodocs page background
    appBorderColor: 'rgba(255,255,255,0.05)',
    textColor: '#f1f5f9',

    barTextColor: '#94a3b8',
    barSelectedColor: '#6366f1',
    barBg: '#0f172a',

    // Input/form colors
    inputBg: '#1e293b',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputTextColor: '#f1f5f9',
    inputBorderRadius: 6,
  });
};

type Props = {
  context: DocsContextProps;
  children?: ReactNode;
};

export const ThemedDocsContainer = ({ children, context }: Props) => {
  // Get the current theme from story globals, default to dark
  const story = context.componentStories()[0];
  const globals = story ? context.getStoryContext(story).globals : {};
  const themeId = (globals.theme as string) || 'dark';

  const theme = createCellarTheme(themeId === 'light' ? 'light' : 'dark');

  return (
    <DocsContainer theme={theme} context={context}>
      {children}
    </DocsContainer>
  );
};

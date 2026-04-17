import { create } from 'storybook/theming';
import { addons } from 'storybook/manager-api';

const cellarTheme = create({
  base: 'dark',

  brandTitle: 'Cellar',
  brandUrl: '/',
  brandImage: '/cellar-logo.svg',
  brandTarget: '_self',

  colorPrimary: '#6366f1',
  colorSecondary: '#94a3b8',

  appBg: '#0f172a',
  appContentBg: '#1e293b',
  appBorderColor: 'rgba(255,255,255,0.05)',
  textColor: '#f1f5f9',

  barTextColor: '#94a3b8',
  barSelectedColor: '#6366f1',
  barBg: '#0f172a',
});

addons.setConfig({
  theme: cellarTheme,
});

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Upstreet Docs',
  tagline: 'Your technical guide through the world of Upstreet!',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.upstreet.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'upstreetai', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/upstreet-social-card.jpg',
    navbar: {
      title: 'Upstreet Docs',
      logo: {
        alt: 'Upstreet Logo',
        src: 'img/upstreet_logo_dark.svg',
      },
      items: [
        {to: '/docs/sdk', label: 'SDK', position: 'left'},
        {
          href: 'https://chat.upstreet.ai',
          label: 'Chat',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/usdk',
          label: 'USDK',
          position: 'right',
        },
        {
          href: 'https://upstreet.ai',
          label: 'Website',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Upstreet SDK',
              to: '/docs/sdk',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/r2U2gkNq9j',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/upstreetai',
            },
          ],
        },
        {
          title: 'More',
          items: [
            // {
            //   label: 'Blog',
            //   to: '/blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/upstreetai',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Upstreet, Inc. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

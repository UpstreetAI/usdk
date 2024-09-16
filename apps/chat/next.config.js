/** @type {import('next').NextConfig} */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: '*.upstreet.ai',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: '*.discordapp.com',
        port: '',
        pathname: '**'
      },
    ]
  },
  webpack: (config, options) => {
    // noParse
    config.module.noParse = /typescript\/lib\/typescript\.js$/;

    // fix react resolution in sdk subpackage
    const usdkPath = path.resolve(__dirname, '../../packages/usdk');
    const upstreetAgentPath = path.resolve(__dirname, '../../packages/usdk/packages/upstreet-agent');
    const reactAgentsPath = path.resolve(__dirname, '../../packages/usdk/packages/upstreet-agent/packages/react-agents');
    const replacePlugin = (scopePath, moduleRegexp) => {
      return new webpack.NormalModuleReplacementPlugin(moduleRegexp, (resource) => {
        if (resource.context.includes(scopePath)) {
          const p = require.resolve(resource.request, {
            paths: [scopePath],
          });
          resource.request = p;
        }
      });
    };
    config.plugins.push(
      replacePlugin(reactAgentsPath, /^react/),
      replacePlugin(upstreetAgentPath, /^react/),
      replacePlugin(usdkPath, /^react/),
    );

    return config;
  },
}

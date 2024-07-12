/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    nextScriptWorkers: true,
  },
  webpack: (config, { isServer }) => {
    
    // Enable WebAssembly experiments
    config.experiments = { asyncWebAssembly: true, syncWebAssembly: true, layers: true, topLevelAwait: true};
    // Ensure WebAssembly modules are properly flagged
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource'
      // Or use 'webassembly/sync' if using syncWebAssembly experiment
      // type: 'webassembly/sync',
    });

    // Prevent Webpack from trying to resolve 'fs' on the client side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
      config.output.globalObject = 'self';
      config.optimization.splitChunks = {
        chunks: (chunk) => {
          // this may vary widely on your loader config
          if (chunk.name && chunk.name.includes("worklet")) {
            return false;
          }
    
          return true;
        }
      }
    }

    return config;
  },
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
}

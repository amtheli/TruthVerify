const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background/index.ts',
    content: './src/content_scripts/content.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          }
        },
        exclude: /node_modules\/(?!@cheqd\/ts-proto)/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "os": require.resolve("os-browserify/browser"),
      "vm": require.resolve("vm-browserify")
    }
  },
  output: {
    filename: (pathData) => {
      // Place content.js and background.js in the root directory
      if (pathData.chunk.name === 'content' || pathData.chunk.name === 'background') {
        return '[name].js';
      }
      return '[name]/index.js';
    },
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/models', to: 'models' },
        { from: 'icon16.svg', to: '.' },
        { from: 'icon48.svg', to: '.' },
        { from: 'icon128.svg', to: '.' },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/index.html',
      filename: 'popup/index.html',
      chunks: ['popup'],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: (chunk) => {
        // Don't split content.js and background.js
        return chunk.name !== 'content' && chunk.name !== 'background';
      },
      maxSize: 512000, // 512kb as specified in config
    },
  },
}; 
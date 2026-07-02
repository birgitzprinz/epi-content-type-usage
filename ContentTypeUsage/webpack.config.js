const path = require('path');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: './ClientResources/Scripts/index.jsx',
    output: {
      filename: 'app.bundle.js',
      path: path.resolve(__dirname, 'ClientResources/Scripts/dist'),
    },
    // Development: eval-source-map gives the fastest incremental rebuilds while
    // still mapping errors back to the original JSX source lines.
    // Production: source-map writes a standalone .map file alongside the bundle.
    devtool: isDev ? 'eval-source-map' : 'source-map',
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              // Preserve source file names inside the map so the browser debugger
              // shows the original .jsx paths rather than webpack-internal:// URLs.
              sourceMaps: true,
            },
          },
        },
      ],
    },
  };
};

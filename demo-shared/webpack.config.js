const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/main.js'),
  output: { filename: 'bundle.js', clean: true }, // emits dist/bundle.js and wipes old builds,
  devServer: { static: path.resolve(__dirname, '.'), port: 8081 },

  // Remove below if running demo outside tangi project and @pricingmonkey/tangi dependency is available
  resolve: {
    alias: {
      '@pricingmonkey/tangi': path.resolve(__dirname, '../lib'),
    },
  },
};

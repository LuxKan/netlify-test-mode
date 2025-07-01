module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable source map generation
      webpackConfig.devtool = false;
      
      // Suppress source map warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Module Warning \(from .*source-map-loader/,
      ];
      
      return webpackConfig;
    },
  },
}; 
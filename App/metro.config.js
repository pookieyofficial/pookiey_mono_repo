const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "react-async-hook": require.resolve("react-async-hook"),
};

// Suppress InternalBytecode.js errors (Metro symbolication issue)
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Suppress InternalBytecode.js errors
      if (req.url && req.url.includes('InternalBytecode.js')) {
        return res.status(404).end();
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
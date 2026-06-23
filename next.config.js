module.exports = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').join(__dirname),
  outputFileTracingIncludes: {
    '/*': ['./crm/**/*'],
  },
};

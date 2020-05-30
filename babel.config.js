const path = require('path');

const presets = [
  [
    '@babel/preset-env',
    {
      targets: {
        esmodules: true
      }
    }
  ]
];

const plugins = [
  '@babel/plugin-transform-async-to-generator',
  '@babel/plugin-proposal-object-rest-spread',
  [
    'module-resolver', {
      extensions: ['.js'],
      root: [path.resolve(__dirname, 'src')]
    }
  ]
];

module.exports = {
  presets,
  plugins
};

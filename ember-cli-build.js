'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const WrapperPlugin = require('wrapper-webpack-plugin');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    
    webpack: {
      externals: {
        '@trust/webcrypto': 'crypto',
        'child_process': 'null',
        'node-fetch': 'fetch',
        'text-encoding': 'TextEncoder',
        'whatwg-url': 'window',
        'isomorphic-fetch': 'fetch',
        'fs': 'null',
        'solid-auth-client': {
          root: ['solid', 'auth'],
          commonjs: 'solid-auth-client',
          commonjs2: 'solid-auth-client',
        },
        'solid-auth-cli': 'null',
        'xmldom': 'window'
      }
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};

/* global Package */
Package.describe({
  name: 'rlivingston:simple-schema-mixin',
  version: '0.0.1',
  summary: 'A simple schema mixin to use with mdg:validated-method package',
  git: 'https://github.com/rhettlivingston/meteor-simple-schema-mixin.git',
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('1.3.2.2');
  api.use(['ecmascript', 'aldeed:simple-schema@1.4.0']);
  api.addFiles('simple-schema-mixin.js');
  api.export('simpleSchemaMixin');
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('rlivingston:simple-schema-mixin');
  api.addFiles('simple-schema-mixin-tests.js');
});

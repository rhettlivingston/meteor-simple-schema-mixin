/* global Package */
/* eslint-disable max-len,func-names,prefer-arrow-callback */
Package.describe({
  name: 'rlivingston:simple-schema-mixin',
  version: '1.0.0',
  summary: 'A ValidatedMethod mixin that eases use of aldeed SimpleSchema with mdg validated-method',
  git: 'https://github.com/rhettlivingston/meteor-simple-schema-mixin.git',
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('1.2');
  api.use([
    'ecmascript',
    // We need a min of 1.5.0 for "clean" to work. 1.5.2 also adds better err messages. Go for it.
    'aldeed:simple-schema@1.5.2',
    'mdg:validated-method@1.1.0',
    'check',
    'underscore',
  ]);
  api.addFiles('simple-schema-mixin.js');
  api.export('simpleSchemaMixin');
});

Package.onTest(function (api) {
  api.use([
    'ecmascript',
    'rlivingston:simple-schema-mixin',
    'aldeed:simple-schema@1.5.2',
    'mdg:validated-method@1.1.0',
    'practicalmeteor:chai',
  ]);
  api.addFiles('simple-schema-mixin-tests.js');
});

// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from 'meteor/tinytest';

// Import and rename a variable exported by simple-schema-mixin.js.
import { simpleSchemaMixin } from 'meteor/rlivingston:simple-schema-mixin';

// Write your tests here!
// Here is an example.
Tinytest.add('simple-schema-mixin - example', function (test) {
  test.equal(simpleSchemaMixin, 'simple-schema-mixin');
});

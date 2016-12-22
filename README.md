# simple-schema-mixin
[![Build Status](https://travis-ci.org/rhettlivingston/meteor-simple-schema-mixin.svg?branch=master)](https://travis-ci.org/rhettlivingston/meteor-simple-schema-mixin)

*rlivingston:simple-schema-mixin*

An mdg:validated-method mixin that replaces the ValidatedMethod "validate" option with a "schema"
option that accepts a SimpleSchema as defined by aldeed:simple-schema for validation of Method
options.


## Installation

In your Meteor app directory, enter:

```sh
$ meteor add rlivingston:simple-schema-mixin
```

## Basic Usage

This mixin adds two new options, schema and schemaValidatorOptions, to ValidatedMethod.

```js
const method = new ValidatedMethod({
  name: 'method' // DDP method name,
  mixins: [simpleSchemaMixin],

  // Schema to be applied to the arguments. Only keyword arguments are accepted,
  // so the arguments are an object rather than an array. The SimpleSchema validator
  // throws a ValidationError from the mdg:validation-error package if the args don't
  // match the schema.
  schema: {
    intArg: { type: Number },
    stringArg: { type: String, defaultValue: 'just another string' },
  },
  // Optional options specification to be passed to SimpleSchema's validator function.
  schemaValidatorOptions: { clean: true, filter: false },
  run(intArg, stringArg) {
    return 'result';
  }
});
```

The schema option accepts anything accepted by the SimpleSchema constructor. This includes schema
specifications, SimpleSchema objects, and mixtures of both contained within arrays. The richness
of this interface makes it very easy to compose a schema option that combines parameters "picked"
from an existing schema with others specific to the ValidatedMethod. See the examples below to
better understand what can be accomplished.

The schemaValidatorOptions option may be used to replace the options being sent by default to the SimpleSchema validator function. The default is "{ clean: true, filter: false }". This has the
effect of enabling defaultValue specifications in the schema to be processed as they are when
using the aldeed:collections2 package while not filtering out any parameters not specified in the schema. In other words, you may use defaultValue to make ValidatedMethod parameters optional to the caller and still get error messages if you have a typo in a parameter key name or add an extra one.
If you don't like this niceness, just specify { clean : false } and you'll return to validator's default behavior.

Note that because your schemaValidatorOptions will **replace** the default, they must specify
'clean: true' if you're doing anything other than turning off clean. i.e. { filter: true } will not have the desired effect because SimpleSchema will default to not running clean and the filter stage
is within the clean stage. To turn on filtering, you would need to specify { clean: true, filter: true } or just { clean: true } since filter: true is SimpleSchema's default when cleaning.

If the mixin is included
- but both the schema and validate options are missing, both are present and set to null, or only
schema is present and set to null, a defaultValue of {} will be used for the schema having the
effect of enforcing that the method caller provide no parameters. **NOTE: Due to SimpleSchema's requirement that a document always be provided to validate, calling run without an empty document argument will cause an error. i.e. use run({}), not run()**
- but the schema option is missing or null and a non-null validate option is provided,
ValidatedMethod will proceed as if SimpleSchemaMixin had never been added.
- but non-null values are specified for both the schema option and the validate option, a
Meteor.Error will be thrown.

### Examples

```js

// elsewhere in app
const Schema = {};

Schema.group = new SimpleSchema({
  // fyi, older versions of aldeed:SimpleSchema can have problems with the _id being
  // defined in some contexts. The current 2.9.1 version has not given me any problems.
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  visibility: {
    type: String,
    allowedValues: [
      'public',
      'community',
      'private',
    ],
    defaultValue: 'private',
  },
  ...
});

Groups.attachSchema(Schema.group);


// In the methods.js file
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { simpleSchemaMixin } from 'meteor/rlivingston:simple-schema-mixin';
...
const GROUP_ID_ONLY = new SimpleSchema({
  // This is a nice technique to reuse the schema spec while renaming the key for the sake
  // of greater clarity in the Method interface.
  groupId: Groups.simpleSchema().schema(['_id']),
});

export const insert = new ValidatedMethod({
  name: 'groups.insert',
  mixins: [simpleSchemaMixin],
  // Note the use of pick to cherry pick elements from an existing schema. Defaults will
  // be implemented for both description and visibility per the schema.
  schema: Groups.simpleSchema().pick([
    'name',
    'description',
    'visibility']),
  run({ name, description, visibility }) {
    ...
  },
});

export const archive = new ValidatedMethod({
  name: 'groups.archive',
  mixins: [simpleSchemaMixin],
  schema: GROUP_ID_ONLY,
  run({ groupId }) {
    ...
  },
});

export const rename = new ValidatedMethod({
  name: 'groups.rename',
  mixins: [simpleSchemaMixin],
  // Note the use of two SimpleSchema objects in an array.
  // The SimpleSchema constructor combines them for us.
  schema: [GROUP_ID_ONLY, Groups.simpleSchema().pick(['name'])],
  run({ groupId, name }) {
    ...
  },
});

export const setIsAdmin = new ValidatedMethod({
  name: 'groups.setIsAdmin',
  mixins: [simpleSchemaMixin],
  // Note the use of both a SimpleSchema option and a directly specified schema in this example.
  // I wanted to show this, though in my app I picked them from a subschema that defines the
  // group members array elements.
  schema: [
    GROUP_ID_ONLY,
    {
      memberId: { type: String },
      isAdmin: { type: Boolean },
    },
  ],
  run({ groupId, memberId, isAdmin }) {
    ...
  },
});
```


## License

MIT

## Testing

Test per meteor's guide using `meteor test-packages ./ --driver-package practicalmeteor:mocha`.

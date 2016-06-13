/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

/* global Meteor */
/* global ValidatedMethod */
/* global assert */
/* global simpleSchemaMixin */

// import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const plainMethod = new ValidatedMethod({
  name: 'plainMethod',
  mixins: [simpleSchemaMixin],
  schema: {},
  run() {
    return 'result';
  },
});

const noArgsMethod = new ValidatedMethod({
  name: 'noArgsMethod',
  mixins: [simpleSchemaMixin],
  schema: null,
  run() {
    return 'result';
  },
});

const methodWithArgs = new ValidatedMethod({
  name: 'methodWithArgs',
  mixins: [simpleSchemaMixin],
  schema: {
    int: { type: Number },
    string: { type: String },
  },
  run() {
    return 'result';
  },
});

const methodWithSchemaMixin = new ValidatedMethod({
  name: 'methodWithSchemaMixin',
  mixins: [simpleSchemaMixin],
  schema: {
    int: { type: Number },
    string: { type: String },
  },
  run() {
    return 'result';
  },
});

const methodThrowsImmediately = new ValidatedMethod({
  name: 'methodThrowsImmediately',
  mixins: [simpleSchemaMixin],
  schema: null,
  run() {
    throw new Meteor.Error('error');
  },
});

const methodReturnsName = new ValidatedMethod({
  name: 'methodReturnsName',
  validate: null,
  run() {
    return this.name;
  },
});

let resultReceived = false;
const methodWithApplyOptions = new ValidatedMethod({
  name: 'methodWithApplyOptions',
  mixins: [simpleSchemaMixin],
  schema: {},
  applyOptions: {
    onResultReceived: () => {
      resultReceived = true;
    },
  },
  run() {
    return 'result';
  },
});

describe('basic mdg:validated-method tests still work', function () {
  it('defines a method that can be called', function (done) {
    plainMethod.call({}, (error, result) => {
      assert.equal(result, 'result');

      Meteor.call(plainMethod.name, {}, (error2, result2) => {
        assert.equal(result2, 'result');
        done();
      });
    });
  });

  it.skip('allows methods that take no arguments', function (done) {
    noArgsMethod.call((error, result) => {
      assert.equal(result, 'result');

      Meteor.call(noArgsMethod.name, (error2, result2) => {
        assert.equal(result2, 'result');
        done();
      });
    });
  });

  [methodWithArgs, methodWithSchemaMixin].forEach((method) => {
    it(`checks schema ${method.name}`, function (done) {
      method.call({}, (error) => {
        // 2 invalid fields
        assert.equal(error.errors.length, 2);

        method.call({
          int: 5,
          string: 'what',
        }, (error2, result) => {
          // All good!
          assert.equal(result, 'result');

          done();
        });
      });
    });
  });

  it('throws error if no callback passed', function (done) {
    methodThrowsImmediately.call({}, (err) => {
      // If you pass a callback, you get the error in the callback
      assert.ok(err);

      // If no callback, the error is thrown
      assert.throws(() => {
        methodThrowsImmediately.call({});
      }, /error/);

      done();
    });
  });

  it('throws error if a mixin does not return the options object', function () {
    assert.throws(() => {
      new ValidatedMethod({ // eslint-disable-line no-new
        name: 'methodWithFaultySchemaMixin',
        mixins: [function nonReturningFunction() {}],
        schema: null,
        run() {
          return 'result';
        },
      });
    // eslint-disable-next-line max-len
    }, /Error in methodWithFaultySchemaMixin method: The function 'nonReturningFunction' didn't return the options object/);

    assert.throws(() => {
      new ValidatedMethod({ // eslint-disable-line no-new
        name: 'methodWithFaultySchemaMixin',
        mixins: [function (args) { return args; }, function () {}],
        schema: null,
        run() {
          return 'result';
        },
      });
    // eslint-disable-next-line max-len
    }, /Error in methodWithFaultySchemaMixin method: One of the mixins didn't return the options object/);
  });

  it('has access to the name on this.name', function (done) {
    const ret = methodReturnsName._execute();
    assert.equal(ret, 'methodReturnsName');

    methodReturnsName.call({}, (err, res) => {
      // The Method knows its own name
      assert.equal(res, 'methodReturnsName');

      done();
    });
  });

  // the only apply option that I can think of to test is client side only
  if (!Meteor.isServer) {
    it('can accept Meteor.apply options', function (done) {
      methodWithApplyOptions.call({}, () => {
        // The Method knows its own name
        assert.equal(resultReceived, true);

        done();
      });
    });
  }
});

const methodUsingDefaultValidate = new ValidatedMethod({
  name: 'methodUsingDefaultValidate',
  mixins: [simpleSchemaMixin],
  validate: () => {},
  run() {
    return 'result';
  },
});

const methodUsingNullValidate = new ValidatedMethod({
  name: 'methodUsingNullValidate',
  mixins: [simpleSchemaMixin],
  validate: null,
  run() {
    return 'result';
  },
});

const methodUsingDefaultValidateAndNullSchema = new ValidatedMethod({
  name: 'methodUsingDefaultValidateAndNullSchema',
  mixins: [simpleSchemaMixin],
  schema: null,
  validate: () => {},
  run() {
    return 'result';
  },
});

const methodUsingNullValidateAndNullSchema = new ValidatedMethod({
  name: 'methodUsingNullValidateAndNullSchema',
  mixins: [simpleSchemaMixin],
  schema: null,
  validate: null,
  run() {
    return 'result';
  },
});

const methodUsingNullValidateAndDefaultSchema = new ValidatedMethod({
  name: 'methodUsingNullValidateAndDefaultSchema',
  mixins: [simpleSchemaMixin],
  schema: {},
  validate: null,
  run() {
    return 'result';
  },
});

const methodWithNoSchemaOrValidate = new ValidatedMethod({
  name: 'methodWithNoSchemaOrValidate',
  mixins: [simpleSchemaMixin],
  run() {
    return 'result';
  },
});

const methodWithSchemaAndFilterTrue = new ValidatedMethod({
  name: 'methodWithSchemaAndFilterTrue',
  mixins: [simpleSchemaMixin],
  schemaValidatorOptions: { clean: true, filter: true },
  run() {
    return 'result';
  },
});

describe('rlivingston:simple-schema-mixin', function () {
  it('allows validate in lieu of schema - only validate present', function (done) {
    // validate ignores unexpected arguments by default. schema does not. So, if ignored, we pass.
    methodUsingDefaultValidate.call({ unexpectedArg: 'test' }, (error, result) => {
      assert.equal(result, 'result');
      done();
    });
  });

  it('allows validate in lieu of schema - only null validate present', function (done) {
    // validate ignores unexpected arguments by default. schema does not. So, if ignored, we pass.
    methodUsingNullValidate.call({ unexpectedArg: 'test' }, (error, result) => {
      assert.equal(result, 'result');
      done();
    });
  });

  it('allows validate in lieu of schema - validate present with null schema'
  , function (done) {
    // validate ignores unexpected arguments by default. schema does not. So, if ignored, we pass.
    methodUsingDefaultValidateAndNullSchema.call({ unexpectedArg: 'test' }, (error, result) => {
      assert.equal(result, 'result');
      done();
    });
  });

  it('defaults to {} if no schema or validate supplied', function (done) {
    methodWithNoSchemaOrValidate.call({ unexpectedArg: 'test' }, (error) => {
      // If ValidateMethod handled it, its default stub does no validation. Thus
      // there will be no validation-error due to the unexpectedArg. Therefore if we get a
      // validation-error, all is good.
      assert.equal(error.error, 'validation-error');
      done();
    });
  });

  it('defaults to {} if null schema and null validate supplied', function (done) {
    methodUsingNullValidateAndNullSchema.call({ unexpectedArg: 'test' }, (error) => {
      // If ValidateMethod handled it, its default stub does no validation. Thus
      // there will be no validation-error due to the unexpectedArg. Therefore if we get a
      // validation-error, all is good.
      assert.equal(error.error, 'validation-error');
      done();
    });
  });

  it('uses schema if schema and null validate supplied', function (done) {
    methodUsingNullValidateAndDefaultSchema.call({ unexpectedArg: 'test' }, (error) => {
      // If ValidateMethod handled it, its default stub does no validation. Thus
      // there will be no validation-error due to the unexpectedArg. Therefore if we get a
      // validation-error, all is good.
      assert.equal(error.error, 'validation-error');
      done();
    });
  });

  it('throws error if both schema and validate supplied', function () {
    assert.throws(() => {
      new ValidatedMethod({ // eslint-disable-line no-new
        name: 'methodWithSchemaAndValidate',
        mixins: [simpleSchemaMixin],
        schema: {},
        validate: () => {},
        run() {
          return 'result';
        },
      });
    // eslint-disable-next-line max-len
    }, /"schema" and "validate" options cannot be used together/);
  });

  it('schemaValidatorOptions overrides our defaults', function (done) {
    methodWithSchemaAndFilterTrue.call({ unexpectedArg: 'test' }, (error, result) => {
      // with filter set to true, the unexpectedArg will just be quietly thrown away.
      assert.equal(result, 'result');
      done();
    });
  });
});

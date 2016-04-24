/* global simpleSchemaMixin:true */
/* global SimpleSchema */
/* global Meteor */
simpleSchemaMixin = function SimpleSchemaMixinFunc(methodOptions) {
  // If the user didn't give us a schema and they did give us a validate, assume
  // that they are choosing to use the validate way of doing things in this call.
  //  If they've built a wrapper around ValidateMethod that includes this mixin
  // all the time, this could happen semi-"intentionally". There may be times they
  // just don't want to use a schema and have specified a "validate" option. So
  // returning the unchanged options instead of an error seems proper.
  if ((!methodOptions.schema || methodOptions.schema === null) &&
      methodOptions.validate && methodOptions.validate !== null) {
    return methodOptions;
  }

  // If they truly gave us both... that just doesn't seem proper.
  if (methodOptions.validate && methodOptions.validate !== null) {
    throw new Meteor.Error(
      'simpleSchemaMixin.options',
      '"schema" and "validate" options cannot be used together');
  }

  const newOptions = methodOptions;
  newOptions.schemaValidatorOptions =
    newOptions.schemaValidatorOptions ||
    { clean: true, filter: false };
  let simpleSchema;
  if (!newOptions.schema || newOptions.schema === null) {
    // Allow simply leaving off both the schema and validate specifications
    // or setting them to "null" as a shorthand. In this case, unlike
    // the straight default validate or typical coder's call to validator,
    // we will ENFORCE the Method be called without parameters because of
    // the "filter: false" above.
    simpleSchema = new SimpleSchema({});
  } else if (newOptions.schema instanceof SimpleSchema) {
    // In this one case, we can save ourselves the time to make a schema out
    // of the schema.
    simpleSchema = newOptions.schema;
  } else {
    simpleSchema = new SimpleSchema(newOptions.schema);
  }
  newOptions.validate = simpleSchema.validator(newOptions.schemaValidatorOptions);
  return newOptions;
};

/* global SimplyValidatedMethod:true */
/* global ValidatedMethod */
/* global check */
/* global _ */
SimplyValidatedMethod = class SimplyValidatedMethod extends ValidatedMethod {
  constructor(options) {
    // eslint-disable-next-line no-param-reassign
    options.mixins = options.mixins || [];
    check(options.mixins, [Function]);
    // eslint-disable-next-line no-param-reassign
    options.mixins = _.union(options.mixins, [simpleSchemaMixin]);

    super(options);
  }
};

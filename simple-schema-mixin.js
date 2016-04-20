/* global simpleSchemaMixin:true */
/* global SimpleSchema */
/* global Meteor */
simpleSchemaMixin = function SimpleSchemaMixinFunc(methodOptions) {
  // Can't do anything if the user didn't give us a schema. If they've built a
  // wrapper around ValidateMethod that includes this mixin all the time, this
  // could happen "intentionally". There may be times they just don't want to
  // use a schema and have specified a "validate" option or are even letting it
  // default. So returning the unchanged options instead of an error seems proper.
  if (!methodOptions.schema) {
    return methodOptions;
  }

  if (methodOptions.validate) {
    throw new Meteor.Error(
      'simpleSchemaMixin.options',
      '"schema" and "validate" options cannot be used together');
  }

  const newOptions = methodOptions;
  newOptions.schemaValidatorOptions =
    newOptions.schemaValidatorOptions ||
    { clean: true, filter: false };
  let simpleSchema;
  if (newOptions.schema instanceof SimpleSchema) {
    // In this one case, we can save ourselves the time to make a schema out
    // of the schema.
    simpleSchema = newOptions.schema;
  } else {
    simpleSchema = new SimpleSchema(newOptions.schema);
  }
  newOptions.validate = simpleSchema.validator(newOptions.schemaValidatorOptions);
  return newOptions;
};

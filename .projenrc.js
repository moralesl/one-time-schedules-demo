const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.96.2',
  defaultReleaseBranch: 'main',
  name: 'one-time-schedules-demo',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */

  mergify: false,
  npmignoreEnabled: false,
  eslint: false,
  jest: false
});
project.synth();
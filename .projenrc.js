const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.146.0',
  defaultReleaseBranch: 'main',
  name: 'one-time-schedules-demo',

  deps: ['@types/aws-lambda'],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'aws-sdk',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/util-dynamodb',
    '@faker-js/faker',
    'commander',
    'axios',

    // CDK
    '@aws-cdk/aws-scheduler-alpha',
    '@aws-cdk/aws-apigatewayv2-alpha',
    '@aws-cdk/aws-apigatewayv2-integrations-alpha', /* Build dependencies for this module. */
  ],
  // packageName: undefined,  /* The 'name' in package.json. */

  mergify: false,
  npmignoreEnabled: false,
  eslint: false,
  jest: false,
  disableTsconfigDev: true,

  buildWorkflowTriggers: {
    push: {},
    pullRequest: {},
    workflowDispatch: {},
  },
});

project.addTask('create-products', {
  exec: 'ts-node scripts/create-products.ts',
})

project.addTask('set-products-out-of-stock', {
  exec: 'ts-node scripts/set-products-out-of-stock.ts',
  receiveArgs: true,
})

project.synth();

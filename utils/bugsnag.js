const bugsnag = require('@bugsnag/js');
const bugsnagExpress = require('@bugsnag/plugin-express');

const bugsnagClient = bugsnag({
  apiKey: process.env.BUGSNAG_TOKEN,
  releaseStage: process.env.ENVIRONMENT,
  notifyReleaseStages: ['staging', 'production']
});

bugsnagClient.use(bugsnagExpress);

module.exports = bugsnagClient;

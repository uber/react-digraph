import { STG_BUCKET, PROD_BUCKET } from '../cognito';

const STG = 'staging';
const PROD = 'production';
const ENVS = [STG, PROD];
const ENV_BUCKETS = {
  [STG]: STG_BUCKET,
  [PROD]: PROD_BUCKET,
};

const getFlowManagementHandlers = app => {
  app.getFlows = function(env) {
    return new Promise(
      function(resolve, reject) {
        this.state.s3.listObjects(
          {
            Bucket: ENV_BUCKETS[env],
            Delimiter: '/',
          },
          function(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data.Contents.filter(f => f.Key.endsWith('.json')));
            }
          }
        );
      }.bind(app)
    );
  }.bind(app);

  app.newFlow = function() {
    this.setFlow(null, '{}');
  }.bind(app);

  app.openFlow = function(env, flowName) {
    return this.state.s3
      .getObject({ Bucket: ENV_BUCKETS[env], Key: flowName })
      .promise()
      .then(data => this.setFlow(flowName, data.Body.toString()));
  }.bind(app);

  app.shipFlow = function() {
    return app.saveFlow({ bucket: PROD_BUCKET });
  }.bind(app);

  app.cloneFlow = function() {
    const newFlowName = `${this.state.flowName.slice(0, -5)}-copy.json`;

    return this.saveFlow({ newFlowName });
  }.bind(app);

  app.saveFlow = function({ newFlowName, bucket } = {}) {
    const { jsonText, s3 } = this.state;
    const flowName = newFlowName || this.state.flowName;
    const params = {
      Bucket: bucket || STG_BUCKET,
      Key: flowName,
      Body: jsonText,
    };
    const options = {};

    return s3
      .upload(params, options)
      .promise()
      .then(() => this.setFlow(flowName, jsonText));
  }.bind(app);

  app._flowExists = function(flowName) {
    const params = { Key: flowName };

    return this.state.s3
      .headObject(params)
      .promise()
      .then(() => true)
      .catch(err => {
        if (err.code === 'NotFound') {
          return false;
        } else {
          throw err;
        }
      });
  }.bind(app);

  app.deleteFlow = function() {
    const { s3, flowName } = this.state;

    s3.deleteObject({ Key: flowName })
      .promise()
      .then(() => this.newFlow());
  }.bind(app);

  app.renameFlow = function(newFlowName) {
    const { flowName, jsonText, s3 } = this.state;

    return this._flowExists(newFlowName).then(exists => {
      if (exists) {
        throw 'Flow already exists';
      } else {
        if (!flowName) {
          return this.saveFlow({ newFlowName });
        }

        return s3
          .copyObject({
            Bucket: STG_BUCKET,
            CopySource: encodeURIComponent(`/${STG_BUCKET}/${flowName}`),
            Key: encodeURIComponent(newFlowName),
          })
          .promise()
          .then(() =>
            // Delete the old object
            s3
              .deleteObject({
                Key: flowName,
              })
              .promise()
              .then(() => this.setFlow(newFlowName, jsonText))
          );
      }
    });
  };

  return app;
};

export { getFlowManagementHandlers, STG, PROD, ENVS };

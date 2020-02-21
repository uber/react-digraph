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

  app.getVersions = function(env = STG) {
    const params = {
      Bucket: ENV_BUCKETS[env],
      Prefix: this.state.flowName,
    };

    return this.state.s3
      .listObjectVersions(params)
      .promise()
      .then(data => data.Versions);
  }.bind(app);

  app.getFlow = function(env, flowName, VersionId) {
    return this.state.s3
      .getObject({ Bucket: ENV_BUCKETS[env], Key: flowName, VersionId })
      .promise()
      .then(data => data.Body.toString());
  }.bind(app);

  app._getProdFlow = function(flowName) {
    return this._flowExists(flowName, PROD).then(exists =>
      exists ? this.getFlow(PROD, flowName) : ''
    );
  }.bind(app);

  app._setFlow = function(flowName, flow, env = STG, versionId) {
    const fetchProdFlow = env === STG && !versionId;

    if (!fetchProdFlow) {
      this.setFlow(flowName, flow, null, env, versionId);
    } else {
      this._getProdFlow(flowName).then(prodFlow =>
        this.setFlow(flowName, flow, prodFlow, env, versionId)
      );
    }
  }.bind(app);

  app.getJsonText = function() {
    return this.state.jsonText;
  }.bind(app);

  app.getProdJsonText = function() {
    return this.state.prodJsonText;
  }.bind(app);

  app.openFlow = function(env, flowName, versionId) {
    return this.getFlow(env, flowName, versionId).then(flow =>
      this._setFlow(flowName, flow, env, versionId)
    );
  }.bind(app);

  app.shipFlow = function() {
    return app.saveFlow({ env: PROD });
  }.bind(app);

  app.cloneFlow = function() {
    const newFlowName = `${this.state.flowName.slice(0, -5)}-copy.json`;

    return this.saveFlow({ newFlowName });
  }.bind(app);

  app.saveFlow = function({ newFlowName, env = STG } = {}) {
    const { jsonText, s3 } = this.state;
    const flowName = newFlowName || this.state.flowName;
    const params = {
      Bucket: ENV_BUCKETS[env],
      Key: flowName,
      Body: jsonText,
      ContentType: 'application/json;charset=utf-8',
    };
    const options = {};

    return s3
      .upload(params, options)
      .promise()
      .then(() => this._setFlow(flowName, jsonText));
  }.bind(app);

  app._flowExists = function(flowName, env = STG) {
    const params = { Bucket: ENV_BUCKETS[env], Key: flowName };

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

    return s3
      .deleteObject({ Key: flowName })
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
              .then(() => this._setFlow(newFlowName, jsonText))
          );
      }
    });
  };

  return app;
};

export { getFlowManagementHandlers, STG, PROD, ENVS };

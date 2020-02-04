import { BUCKET } from '../cognito';

const getFlowManagementHandlers = app => {
  app.getFlows = function() {
    return new Promise(
      function(resolve, reject) {
        this.state.s3.listObjects({ Delimiter: '/' }, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data.Contents);
          }
        });
      }.bind(app)
    );
  }.bind(app);

  app.newFlow = function() {
    this.setOpenedFlow(null, '{}');
  }.bind(app);

  app.openFlow = function(flowName) {
    this.state.s3.getObject(
      { Key: flowName },
      function(err, data) {
        if (err) {
          throw new Error(err);
        } else {
          const jsonText = data.Body.toString();

          this.setOpenedFlow(flowName, jsonText);
        }
      }.bind(app)
    );
  }.bind(app);

  app.saveFlow = function(newFlowName) {
    let { flowName } = this.state;
    const { jsonText, s3 } = this.state;

    flowName = newFlowName || flowName;
    const params = {
      Key: flowName,
      Body: jsonText,
    };
    const options = {};

    s3.upload(
      params,
      options,
      function(err, data) {
        if (err) {
          throw new Error(err);
        } else {
          this.setOpenedFlow(flowName, jsonText);
        }
      }.bind(app)
    );
  }.bind(app);

  app._flowExists = function(flowName) {
    const params = { Key: flowName };

    return this.state.s3
      .headObject(params)
      .promise()
      .then(() => true)
      .catch(err => err.code !== 'NotFound');
  }.bind(app);

  app.renameFlow = function(newFlowName) {
    const { flowName, jsonText, s3 } = this.state;

    this._flowExists(newFlowName).then(exists => {
      if (exists) {
        return;
      } else {
        if (!flowName) {
          this.saveFlow(newFlowName);

          return;
        }
        // Copy the object to a new location

        s3.copyObject({
          Bucket: BUCKET,
          CopySource: encodeURIComponent(`/${BUCKET}/${flowName}`),
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
              .then(() => this.setOpenedFlow(newFlowName, jsonText))
          );
      }
    });
  };

  return app;
};

export default getFlowManagementHandlers;

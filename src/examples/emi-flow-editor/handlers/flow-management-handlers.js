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

  app.saveFlow = function() {
    const { flowName, jsonText } = this.state;
    const params = {
      Key: flowName,
      Body: jsonText,
    };
    const options = {};

    this.state.s3.upload(
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

  return app;
};

export default getFlowManagementHandlers;

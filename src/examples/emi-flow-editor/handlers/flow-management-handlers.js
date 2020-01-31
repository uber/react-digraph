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
          const unsavedChanges = false;

          this.setState({ jsonText, flowName, unsavedChanges });
        }
      }.bind(app)
    );
  }.bind(app);

  return app;
};

export default getFlowManagementHandlers;

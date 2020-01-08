const getServerHandlers = (bwdlEditable, parentProp) => {
  bwdlEditable.getServerParent = function(nodeJson) {
    return parentProp ? nodeJson[parentProp] : nodeJson;
  };

  bwdlEditable.onChangeServer = function(serverEnabled) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(newBwdlJson[index], parentProp);

      if (serverEnabled) {
        serverParent.server = {
          method: 'PUT',
          url: 'http://...',
          param: '',
          params: [],
        };
      } else {
        delete serverParent.server;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServerParam = function(value) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const hasParam = this.state.bwdlJson[index].server.param;
      const serverParent = this.getServerParent(newBwdlJson[index], parentProp);

      if (!hasParam && value) {
        serverParent.server.translate = {};
        newBwdlJson[index].question.quickReplies.forEach(reply => {
          serverParent.server.translate[reply] = reply;
        });
      } else if (hasParam && !value) {
        delete serverParent.server.translate;
      }

      serverParent.server.param = value;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServerProp = function(prop, value) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(newBwdlJson[index], parentProp);

      serverParent.server[prop] = value;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServerIncludeAnswers = function(enabled) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(newBwdlJson[index], parentProp);

      if (enabled) {
        serverParent.server.includeAnswers = [
          newBwdlJson[index].question.quickReplies[0],
        ];
      } else {
        delete serverParent.server.includeAnswers;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServerTranslate = function(key, newValue) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(newBwdlJson[index], parentProp);

      serverParent.server.translate[key] = newValue;
    });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getServerHandlers;

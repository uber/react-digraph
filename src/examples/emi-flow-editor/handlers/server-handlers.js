const getServerHandlers = bwdlEditable => {
  bwdlEditable.getServerParent = function(parentProp) {
    const gnode = this.state.selected.gnode;

    return parentProp ? gnode[parentProp] : gnode;
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServer = function(serverEnabled, parentProp) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(parentProp);

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

  bwdlEditable.onChangeServerParam = function(value, parentProp) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const hasParam = this.state.bwdlJson[index].server.param;
      const serverParent = this.getServerParent(parentProp);

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

  bwdlEditable.onChangeServerProp = function(prop, value, parentProp) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(parentProp);

      serverParent.server[prop] = value;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServerIncludeAnswer = function(enabled, parentProp) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(parentProp);

      if (enabled) {
        serverParent.server.includeAnswer = [
          newBwdlJson[index].question.quickReplies[0],
        ];
      } else {
        delete serverParent.server.includeAnswer;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServerTranslate = function(key, newValue, parentProp) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(parentProp);

      serverParent.server.translate[key] = newValue;
    });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getServerHandlers;

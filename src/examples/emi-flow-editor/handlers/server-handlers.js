import {
  SERVER_TYPE,
  ENDPOINT_TYPE,
  CUSTOM_TYPE,
  URL_TYPES_DEFAULTS,
} from '../flow-defs-api';

const getServerHandlers = bwdlEditable => {
  bwdlEditable.getServerParent = function(parentProp) {
    const gnode = this.state.selected.gnode;

    return parentProp ? gnode[parentProp] : gnode;
  }.bind(bwdlEditable);

  bwdlEditable.changeServer = function(parentProp, f) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const serverParent = this.getServerParent(parentProp);

      f(newBwdlJson, index, serverParent);
    });
  }.bind(bwdlEditable);

  bwdlEditable.getUrlType = function(parentProp) {
    const serverParent = this.getServerParent(parentProp);
    const url = serverParent.server['url'];

    if (url.startsWith('{{')) {
      if (url.endsWith('}}')) {
        return ENDPOINT_TYPE;
      } else {
        return SERVER_TYPE;
      }
    } else {
      return CUSTOM_TYPE;
    }
  }.bind(bwdlEditable);

  bwdlEditable.onChangeUrlType = function(value, parentProp) {
    this.changeServer(parentProp, (newBwdlJson, index, serverParent) => {
      serverParent.server['url'] = URL_TYPES_DEFAULTS[value];
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServer = function(serverEnabled, parentProp) {
    this.changeServer(parentProp, (newBwdlJson, index, serverParent) => {
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
    this.changeServer(parentProp, (newBwdlJson, index, serverParent) => {
      const hasParam = this.state.bwdlJson[index].server.param;

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
    this.changeServer(parentProp, (newBwdlJson, index, serverParent) => {
      serverParent.server[prop] = value;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeServerIncludeAnswer = function(enabled, parentProp) {
    this.changeServer(parentProp, (newBwdlJson, index, serverParent) => {
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
    this.changeServer(parentProp, (newBwdlJson, index, serverParent) => {
      serverParent.server.translate[key] = newValue;
    });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getServerHandlers;

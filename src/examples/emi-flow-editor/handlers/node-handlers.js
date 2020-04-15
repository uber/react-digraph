import { NON_NODE_KEYS } from '../../../utilities/transformers/flow-v1-transformer';
import getQuestionNodeHandlers from './question-node-handlers';
import { getModuleNodeHandlers } from './module-node-handlers';

const getNodeHandlers = bwdlEditable => {
  bwdlEditable.onChangeNodeType = function(nodeType) {
    this.changeSelectedNode((node, index, newJson) => {
      const { x, y } = node;

      newJson[index] = { ...this.getDefaultJson(nodeType, index), x, y };
    });
  }.bind(bwdlEditable);

  bwdlEditable.indexAlreadyExists = function(index) {
    return this.state.nodes.find(node => node.gnode.question.index === index);
  }.bind(bwdlEditable);

  bwdlEditable._changeJsonIndex = function(json, prevState, newIndex) {
    const selected = { ...prevState.selected };
    const prevIndex = selected.gnode.question.index;
    const nodeJson = json[prevIndex];

    delete json[prevIndex];

    nodeJson.question.index = newIndex;

    json[newIndex] = nodeJson;

    if (json.current === prevIndex) {
      json.current = newIndex;
    }

    const nodeNames = Object.keys(json);

    nodeNames.forEach(name => {
      const currentNode = json[name];

      if (!currentNode || NON_NODE_KEYS.includes(name)) {
        return;
      }

      const q = currentNode.question;

      q.connections.forEach(connection => {
        if (connection.goto === prevIndex) {
          connection.goto = newIndex;
        }
      });
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeIndex = function(newIndex) {
    if (this.indexAlreadyExists(newIndex)) {
      this.indexRenameAlert = this.alert.error(
        `Cannot rename node: There's another node with '${newIndex}' index`
      );

      return;
    } else if (NON_NODE_KEYS.includes(newIndex)) {
      this.indexRenameAlert = this.alert.error(
        `Cannot rename node: '${newIndex}' is a reserved name`
      );

      return;
    }

    if (this.indexRenameAlert) {
      this.alert.remove(this.indexRenameAlert);
      this.indexRenameAlert = null;
    }

    this.changeJson((json, prevState) =>
      this._changeJsonIndex(json, prevState, newIndex)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onMakeFirst = function() {
    const index = this.state.selected.gnode.question.index;

    // make sure that selected node is a root node
    const nodeNames = Object.keys(this.state.bwdlJson);
    const firstable = nodeNames.every(name => {
      const node = this.state.bwdlJson[name];

      if (!node || NON_NODE_KEYS.includes(name)) {
        return true;
      }

      const q = node.question;

      return q.connections.every(connection => connection.goto !== index);
    });

    if (!firstable) {
      this.alert.error('Cannot make first. There are incoming edges.');

      return;
    }

    this.changeJson(json => {
      json['current'] = index;
    });
  }.bind(bwdlEditable);

  bwdlEditable.questionNodeHandlers = getQuestionNodeHandlers(bwdlEditable);
  bwdlEditable.moduleNodeHandlers = getModuleNodeHandlers(bwdlEditable);

  return bwdlEditable;
};

export default getNodeHandlers;

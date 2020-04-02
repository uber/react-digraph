import getQuestionHandlers from './question-handlers';

const getNodeHandlers = bwdlEditable => {
  bwdlEditable.onChangeNodeType = function(nodeType) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const { x, y } = newBwdlJson[index];

      newBwdlJson[index] = { ...this.getDefaultJson(nodeType, index), x, y };
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeIndex = function(newIndex) {
    const alreadyExists = this.state.nodes.find(
      node => node.gnode.question.index === newIndex
    );

    if (alreadyExists) {
      this.alert.error(
        `Cannot rename node: There's another node with '${newIndex}' index`
      );

      return;
    } else if (['name', 'current', 'faqs'].includes(newIndex)) {
      this.alert.error(`Cannot rename node: '${newIndex}' is a reserved name`);

      return;
    }

    this.changeJson((json, prevState) => {
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

        if (!currentNode || ['name', 'current', 'faqs'].includes(name)) {
          return;
        }

        const q = currentNode.question;

        q.connections.forEach(connection => {
          if (connection.goto === prevIndex) {
            connection.goto = newIndex;
          }
        });
      });
    });
  }.bind(bwdlEditable);

  bwdlEditable.onMakeFirst = function() {
    const index = this.state.selected.gnode.question.index;

    // make sure that selected node is a root node
    const nodeNames = Object.keys(this.state.bwdlJson);
    const firstable = nodeNames.every(name => {
      const currentNode = this.state.bwdlJson[name];

      if (!currentNode || ['name', 'current', 'faqs'].includes(name)) {
        return true;
      }

      const q = currentNode.question;

      return q.connections.every(connection => connection.goto !== index);
    });

    if (!firstable) {
      return;
    }

    this.changeSelectedNode((newBwdlJson, index) => {
      newBwdlJson['current'] = index;
    });
  }.bind(bwdlEditable);

  bwdlEditable.questionHandlers = getQuestionHandlers(bwdlEditable);

  bwdlEditable.moduleInputHandlers = {};

  return bwdlEditable;
};

export default getNodeHandlers;

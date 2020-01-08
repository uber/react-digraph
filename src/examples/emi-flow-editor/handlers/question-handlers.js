const getQuestionHandlers = bwdlEditable => {
  bwdlEditable.onChangeIndex = function(e) {
    const newIndex = e.target.value;

    const alreadyExists = this.state.nodes.find(
      node => node.gnode.question.index === newIndex
    );

    if (alreadyExists || ['name', 'current', 'faqs'].includes(newIndex)) {
      return;
    }

    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };
      const selected = { ...prevState.selected };
      const prevIndex = selected.gnode.question.index;
      const nodeJson = newBwdlJson[prevIndex];

      delete newBwdlJson[prevIndex];

      nodeJson.question.index = newIndex;

      newBwdlJson[newIndex] = nodeJson;

      if (newBwdlJson.current === prevIndex) {
        newBwdlJson.current = newIndex;
      }

      const nodeNames = Object.keys(newBwdlJson);

      nodeNames.forEach(name => {
        const currentNode = newBwdlJson[name];

        if (!currentNode || ['name', 'current', 'faqs'].includes(name)) {
          return;
        }

        const q = currentNode.question;

        // create edges
        q.connections.forEach(connection => {
          if (connection.goto === prevIndex) {
            connection.goto = newIndex;
          }
        });
      });

      // selected.title = newIndex;
      // selected.gnode.question.index = newIndex;

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: this.stringify(newBwdlJson),
        // selected,
      });
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeQuestion = function(property, newValue) {
    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson[index].question[property] = newValue)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeQuickReplies = function(newValue) {
    this.changeSelectedNode((newBwdlJson, index) => {
      newBwdlJson[index].question.quickReplies = newValue;

      if (newValue.length == 0) {
        newBwdlJson[index].question.exactMatch = false;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeImmediateNext = function(newValue) {
    this.changeSelectedNode((newBwdlJson, index) => {
      if (newValue) {
        newBwdlJson[index].question.options = [];
        newBwdlJson[index].question.exactMatch = false;
        newBwdlJson[index].question.errorMessageNotMatch = '';

        if ('ai' in newBwdlJson[index]) {
          delete newBwdlJson[index].ai;
        }
      }

      newBwdlJson[index].question.immediateNext = newValue;
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

    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson['current'] = index)
    );
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getQuestionHandlers;

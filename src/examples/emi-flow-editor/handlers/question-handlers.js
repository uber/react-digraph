const getQuestionHandlers = bwdlEditable => {
  bwdlEditable.onChangeIndex = function(e) {
    const newIndex = e.target.value;

    const alreadyExists = this.state.nodes.find(
      node => node.gnode.question.index === newIndex
    );

    if (alreadyExists || ['name', 'current', 'faqs'].includes(newIndex)) {
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

        // create edges
        q.connections.forEach(connection => {
          if (connection.goto === prevIndex) {
            connection.goto = newIndex;
          }
        });
      });
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeQuestion = function(property, newValue) {
    if (property === 'isAudio' && !newValue) {
      this.state.selected.gnode.question.audioErrorMessage = '';
    } else if (property === 'exactMatch' && !newValue) {
      this.state.selected.gnode.question.errorMessageNotMatch = '';
    }

    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson[index].question[property] = newValue)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeQuickReplies = function(newValue) {
    this.changeSelectedNode((newBwdlJson, index) => {
      newBwdlJson[index].question.quickReplies = newValue;

      if (newValue.length == 0) {
        newBwdlJson[index].question.exactMatch = false;
        newBwdlJson[index].question.errorMessageNotMatch = '';
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeCards = function(newValue) {
    this.changeSelectedNode((newBwdlJson, index) => {
      const question = newBwdlJson[index].question;

      if (!question.cards) {
        question.cards = [{}];
      }

      question.cards[0].buttons = newValue;

      if (newValue.length == 0) {
        question.exactMatch = false;
        question.errorMessageNotMatch = '';
        delete question.cards;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeImmediateNext = function(newValue) {
    const { question, ai, server } = this.state.selected.gnode;

    if (
      newValue &&
      (question.quickReplies.length > 0 || question.exactMatch || ai || server)
    ) {
      return;
    }

    this.onChangeQuestion('immediateNext', newValue);
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

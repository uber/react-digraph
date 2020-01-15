const getFaqHandlers = bwdlEditable => {
  bwdlEditable.getFaqs = function() {
    return this.state.bwdlJson.faqs;
  }.bind(bwdlEditable);

  bwdlEditable.changeFaqs = function(f) {
    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };

      f(newBwdlJson['faqs'], newBwdlJson);

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: this.stringify(newBwdlJson),
      });
    });
  };

  bwdlEditable.onEnableFaqs = function(enable) {
    this.setState(prevState => {
      const newBwdlJson = {
        ...prevState.bwdlJson,
      };

      if (enable) {
        newBwdlJson['faqs'] = {};
      } else {
        delete newBwdlJson['faqs'];
      }

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: this.stringify(newBwdlJson),
      });
    });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getFaqHandlers;

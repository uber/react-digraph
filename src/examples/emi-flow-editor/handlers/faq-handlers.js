import { faqDefaults } from '../empathy';

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
        newBwdlJson['faqs'] = Object.assign({}, faqDefaults);
      } else {
        delete newBwdlJson['faqs'];
      }

      return this.updateNodesFromBwdl({
        bwdlJson: newBwdlJson,
        bwdlText: this.stringify(newBwdlJson),
      });
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeFaqsLang = function(item) {
    this.changeFaqs(faqs => (faqs.lang = item.value));
  }.bind(bwdlEditable);

  bwdlEditable.onChangeFaqsMinSimilarity = function(newValue) {
    if (newValue !== '' && (newValue > 100 || newValue < 1)) {
      return;
    }

    this.changeFaqs(faqs => (faqs.min_similarity = newValue));
  }.bind(bwdlEditable);

  bwdlEditable.onChangeFaqOptions = function(options) {
    this.changeFaqs(faqs => (faqs.options = options));
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getFaqHandlers;

import { faqDefaults } from '../empathy';

const getFaqHandlers = bwdlEditable => {
  bwdlEditable.getFaqs = function() {
    return this.state.bwdlJson.faqs;
  }.bind(bwdlEditable);

  bwdlEditable.changeFaqs = function(f) {
    this.changeJson(json => {
      f(json['faqs'], json);
    });
  };

  bwdlEditable.onEnableFaqs = function(enable) {
    this.changeJson(json => {
      if (enable) {
        json['faqs'] = Object.assign({}, faqDefaults);
      } else {
        delete json['faqs'];
      }
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

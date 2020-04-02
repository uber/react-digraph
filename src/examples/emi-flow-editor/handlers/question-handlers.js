import getAnswerHandlers from './answer-handlers';

const getQuestionHandlers = bwdlEditable => {
  bwdlEditable.changeQuestionProperty = function(property, newValue) {
    this.changeSelectedQuestion(question => {
      question[property] = newValue;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeQuestion = function(property, newValue) {
    this.changeQuestionProperty(property, newValue);
  }.bind(bwdlEditable);

  bwdlEditable.onChangeTextArea = function(property, newValue) {
    if (newValue.length > 2000) {
      return;
    }

    this.changeQuestionProperty(property, newValue);
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

  bwdlEditable.answerHandlers = getAnswerHandlers(bwdlEditable);

  return bwdlEditable;
};

export default getQuestionHandlers;

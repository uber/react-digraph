import getAiHandlers from './ai-handlers';
import getServerHandlers from './server-handlers';

const getAnswerHandlers = bwdlEditable => {
  bwdlEditable.onChangeIsAudio = function(newValue) {
    if (!newValue) {
      this.state.selected.gnode.question.audioErrorMessage = '';
    }

    this.changeQuestionProperty('isAudio', newValue);
  }.bind(bwdlEditable);

  bwdlEditable.onChangeExactMatch = function(newValue) {
    if (!newValue) {
      this.state.selected.gnode.question.errorMessageNotMatch = '';
    }

    this.changeQuestionProperty('exactMatch', newValue);
  }.bind(bwdlEditable);

  bwdlEditable.onChangeQuickReplies = function(newValue) {
    this.changeSelectedQuestion(question => {
      question.quickReplies = newValue;

      if (newValue.length == 0) {
        question.exactMatch = false;
        question.errorMessageNotMatch = '';
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeCards = function(newValue) {
    this.changeSelectedQuestion(question => {
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

  bwdlEditable.aiHandlers = getAiHandlers(bwdlEditable);
  bwdlEditable.serverHandlers = getServerHandlers(bwdlEditable);

  return bwdlEditable;
};

export default getAnswerHandlers;

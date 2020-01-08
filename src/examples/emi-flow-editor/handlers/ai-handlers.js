import { defaultQuestionStr, empathyDefaults } from '../empathy';
import getServerHandlers from './server-handlers';

const getAiHandlers = bwdlEditable => {
  bwdlEditable.setAiDefaults = function(nodeJson, newQuestionStr) {
    nodeJson.ai = Object.assign(
      { question_str: newQuestionStr },
      JSON.parse(JSON.stringify(empathyDefaults[newQuestionStr]))
    );

    const prediction_data = nodeJson.ai.prediction_data;

    if (prediction_data && 'options' in prediction_data) {
      nodeJson.question.quickReplies.forEach(function(quickReply) {
        prediction_data.options[quickReply] = [];
      });
    }
  }.bind(bwdlEditable);

  bwdlEditable.onChangeAI = function(aiEnabled) {
    this.changeSelectedNode((newBwdlJson, index) => {
      if (aiEnabled) {
        this.setAiDefaults(newBwdlJson[index], defaultQuestionStr);
      } else {
        delete newBwdlJson[index].ai;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeAiQuestionStr = function(item) {
    this.changeSelectedNode((newBwdlJson, index) =>
      this.setAiDefaults(newBwdlJson[index], item.value)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangePredictionDataOptions = function(key, newValue) {
    this.changeSelectedNode(
      (newBwdlJson, index) =>
        (newBwdlJson[index].ai.prediction_data.options[key] = newValue)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeLang = function(item) {
    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson[index].ai.lang = item.value)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeCountry = function(item) {
    this.changeSelectedNode(
      (newBwdlJson, index) => (newBwdlJson[index].ai.country = item.value)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeMinSimilarity = function(newValue) {
    if (newValue !== '' && (newValue > 100 || newValue < 1)) {
      return;
    }

    this.changeSelectedNode(
      (newBwdlJson, index) =>
        (newBwdlJson[index].ai.prediction_data.min_similarity = newValue)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeIntentResponse = function(key, newValue) {
    this.changeSelectedNode(
      (newBwdlJson, index) =>
        (newBwdlJson[index].ai.prediction_data.intent_responses[key] = newValue)
    );
  }.bind(bwdlEditable);

  bwdlEditable.aiServerHandlers = getServerHandlers(bwdlEditable, 'ai');

  return bwdlEditable;
};

export default getAiHandlers;

import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactListInput from 'react-list-input';
import { Item, StagingItem } from './common';
import AiEditor from './ai-editor';

class AnswerEditor extends React.Component {
  render() {
    const {
      children,
      onChangeExactMatch,
      onChangeErrorMessageNotMatch,
      onChangeQuickReplies,
      onChangeAI,
      onChangeQuestionStr,
      onChangePredictionDataOptions,
      onChangeLang,
      onChangeMinSimilarity,
      onChangeIntentResponse,
      onChangeCountry,
    } = this.props;
    const node = children;
    const question = node.gnode.question;

    return (
      <div id="answerEditor" className="someNodeEditor">
        <label className="inputList">
          Quick replies:
          <ReactListInput
            initialStagingValue=""
            onChange={onChangeQuickReplies}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={question.quickReplies}
          />
        </label>
        {question.quickReplies.length > 0 && (
          <label>
            Exact match:
            <input
              name="exactMatch"
              type="checkbox"
              checked={question.exactMatch}
              onChange={onChangeExactMatch}
            />
          </label>
        )}
        {question.exactMatch && (
          <label>
            Error Message:
            <TextareaAutosize
              value={question.errorMessageNotMatch}
              onChange={onChangeErrorMessageNotMatch}
            />
          </label>
        )}
        <label>
          AI - Empathy:
          <input
            name="ai"
            type="checkbox"
            checked={'ai' in node.gnode}
            onChange={onChangeAI}
          />
        </label>
        {'ai' in node.gnode && (
          <AiEditor
            onChangeQuestionStr={onChangeQuestionStr}
            onChangePredictionDataOptions={onChangePredictionDataOptions}
            onChangeLang={onChangeLang}
            onChangeMinSimilarity={onChangeMinSimilarity}
            onChangeIntentResponse={onChangeIntentResponse}
            onChangeCountry={onChangeCountry}
          >
            {children}
          </AiEditor>
        )}
      </div>
    );
  }
}

export default AnswerEditor;

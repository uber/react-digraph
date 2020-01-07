import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactListInput from 'react-list-input';
import { Item, StagingItem } from './common';
import AiEditor from './ai-editor';

class AnswerEditor extends React.Component {
  render() {
    const {
      children,
      onChangeQuestion,
      onChangeQuickReplies,
      onChangeAI,
      onChangeAiQuestionStr,
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
              onChange={e => onChangeQuestion('exactMatch', e.target.checked)}
            />
          </label>
        )}
        {question.exactMatch && (
          <label>
            Error Message:
            <TextareaAutosize
              value={question.errorMessageNotMatch}
              onChange={e =>
                onChangeQuestion('errorMessageNotMatch', e.target.value)
              }
            />
          </label>
        )}
        <label>
          Is Audio:
          <input
            name="isAudio"
            type="checkbox"
            checked={question.isAudio}
            onChange={e => onChangeQuestion('isAudio', e.target.checked)}
          />
        </label>
        {question.isAudio && (
          <label>
            No Audio - Error Message:
            <TextareaAutosize
              value={question.audioErrorMessage}
              onChange={e =>
                onChangeQuestion('audioErrorMessage', e.target.value)
              }
            />
          </label>
        )}
        <label>
          AI - Empathy:
          <input
            name="ai"
            type="checkbox"
            checked={'ai' in node.gnode}
            onChange={e => onChangeAI(e.target.checked)}
          />
        </label>
        {'ai' in node.gnode && (
          <AiEditor
            onChangeAiQuestionStr={onChangeAiQuestionStr}
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

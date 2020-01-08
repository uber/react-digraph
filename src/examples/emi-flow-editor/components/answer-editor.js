import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactListInput from 'react-list-input';
import { Item, StagingItem } from './common';
import AiEditor from './ai-editor';
import ServerEditor from './server-editor';

class AnswerEditor extends React.Component {
  render() {
    const {
      children,
      onChangeQuestion,
      onChangeQuickReplies,
      aiHandlers,
      serverHandlers,
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
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Is Audio:
          <input
            name="isAudio"
            type="checkbox"
            checked={question.isAudio}
            onChange={e => onChangeQuestion('isAudio', e.target.checked)}
          />
          {question.isAudio && (
            <label style={{ display: 'flex' }}>
              No Audio - Error Message:
              <TextareaAutosize
                value={question.audioErrorMessage}
                onChange={e =>
                  onChangeQuestion('audioErrorMessage', e.target.value)
                }
              />
            </label>
          )}
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          AI - Empathy:
          <input
            name="ai"
            type="checkbox"
            checked={'ai' in node.gnode}
            onChange={e => aiHandlers.onChangeAI(e.target.checked)}
          />
          {'ai' in node.gnode && (
            <AiEditor
              onChangeAiQuestionStr={aiHandlers.onChangeAiQuestionStr}
              onChangePredictionDataOptions={
                aiHandlers.onChangePredictionDataOptions
              }
              onChangeLang={aiHandlers.onChangeLang}
              onChangeMinSimilarity={aiHandlers.onChangeMinSimilarity}
              onChangeIntentResponse={aiHandlers.onChangeIntentResponse}
              onChangeCountry={aiHandlers.onChangeCountry}
            >
              {children}
            </AiEditor>
          )}
        </label>
        <ServerEditor serverHandlers={serverHandlers}>{children}</ServerEditor>
      </div>
    );
  }
}

export default AnswerEditor;

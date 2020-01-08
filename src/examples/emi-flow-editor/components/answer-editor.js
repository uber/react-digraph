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
            onChange={e => aiHandlers.onChangeAI(e.target.checked)}
          />
        </label>
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
        <label>
          Server request:
          <input
            name="server"
            type="checkbox"
            checked={'server' in node.gnode}
            onChange={e => serverHandlers.onChangeServer(e.target.checked)}
          />
        </label>
        {'server' in node.gnode && (
          <ServerEditor
            onChangeServerProp={serverHandlers.onChangeServerProp}
            onChangeServerIncludeAnswers={
              serverHandlers.onChangeServerIncludeAnswers
            }
            onChangeServerParam={serverHandlers.onChangeServerParam}
            onChangeServerTranslate={serverHandlers.onChangeServerTranslate}
          >
            {children}
          </ServerEditor>
        )}
      </div>
    );
  }
}

export default AnswerEditor;

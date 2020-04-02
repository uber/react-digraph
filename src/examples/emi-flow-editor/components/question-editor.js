import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import AnswerEditor from './answer-editor';

class QuestionEditor extends React.Component {
  render() {
    const { children, questionHandlers } = this.props;
    const {
      onChangeImmediateNext,
      onChangeTextArea,
      answerHandlers,
    } = questionHandlers;
    const node = children;
    const question = node.gnode.question;

    return (
      <div id="nodeEditor" className="rightEditor">
        <label>
          Text:
          <TextareaAutosize
            value={question.text}
            onChange={e => onChangeTextArea('text', e.target.value)}
          />
        </label>
        <label>
          Immediate next:
          <input
            name="immediateNext"
            type="checkbox"
            checked={question.immediateNext}
            onChange={e => onChangeImmediateNext(e.target.checked)}
          />
        </label>
        {!question.immediateNext && (
          <AnswerEditor answerHandlers={answerHandlers}>
            {children}
          </AnswerEditor>
        )}
      </div>
    );
  }
}

export default QuestionEditor;

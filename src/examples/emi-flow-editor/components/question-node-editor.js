import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import AnswerEditor from './answer-editor';
import IndexInput from './index-input';

class QuestionNodeEditor extends React.Component {
  render() {
    const { children, questionNodeHandlers } = this.props;
    const {
      onChangeImmediateNext,
      onChangeIndex,
      onChangeTextArea,
      answerHandlers,
    } = questionNodeHandlers;
    const node = children;
    const question = node.gnode.question;

    return (
      <div id="nodeEditor" className="rightEditor">
        <IndexInput onChangeIndex={onChangeIndex}>{question.index}</IndexInput>
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

export default QuestionNodeEditor;

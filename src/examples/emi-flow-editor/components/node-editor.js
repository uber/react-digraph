import * as React from 'react';

import QuestionEditor from './question-editor';
import IndexInput from './index-input';

class NodeEditor extends React.Component {
  render() {
    const { children, nodeHandlers } = this.props;
    const { questionHandlers, onChangeIndex, onMakeFirst } = nodeHandlers;

    const node = children;
    const question = node.gnode.question;

    return (
      <div id="nodeEditor" className="rightEditor">
        <h1>{question.index}</h1>
        <form onSubmit={e => e.preventDefault()}>
          {node.first ? (
            <label>First flow node.</label>
          ) : (
            <label>
              Click to make this node the first of the flow:
              <input
                name="first"
                type="button"
                value="Make first"
                onClick={onMakeFirst}
              />
            </label>
          )}
          <IndexInput onChangeIndex={onChangeIndex}>{question}</IndexInput>
          <QuestionEditor questionHandlers={questionHandlers}>
            {node}
          </QuestionEditor>
        </form>
      </div>
    );
  }
}

export default NodeEditor;

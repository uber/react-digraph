// Helper styles for demo
import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

class NodeEditor extends React.Component {
  render() {
    const { children, onChangeIndex, onChangeText } = this.props;
    const node = children;

    if (!node) {
      return (
        <div id="nodeEditor">
          <h1>Select a node...</h1>
        </div>
      );
    }

    const question = node.gnode.question;

    return (
      <div id="nodeEditor">
        <h1>{question.index}</h1>
        <form onSubmit={e => e.preventDefault()}>
          <div>
            Index:
            <input
              type="text"
              name="index"
              value={question.index}
              onChange={onChangeIndex}
            />
          </div>
          <div>
            Text:
            <TextareaAutosize value={question.text} onChange={onChangeText} />
          </div>
        </form>
      </div>
    );
  }
}

export default NodeEditor;

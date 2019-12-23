import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

class NodeEditor extends React.Component {
  render() {
    const {
      children,
      onChangeIndex,
      onChangeText,
      onChangeExactMatch,
      onChangeErrorMessageNotMatch,
    } = this.props;
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
          <label>
            Index:
            <input
              type="text"
              name="index"
              value={question.index}
              onChange={onChangeIndex}
              // ref={this.index}
            />
          </label>
          <label>
            Text:
            <TextareaAutosize value={question.text} onChange={onChangeText} />
          </label>
          <label>
            Exact match:
            <input
              name="exactMatch"
              type="checkbox"
              checked={question.exactMatch}
              onChange={onChangeExactMatch}
            />
          </label>
          <label>
            Error Message:
            <TextareaAutosize
              value={question.errorMessageNotMatch}
              onChange={onChangeErrorMessageNotMatch}
            />
          </label>
        </form>
      </div>
    );
  }
}

export default NodeEditor;

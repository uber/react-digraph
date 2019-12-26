import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactListInput from 'react-list-input';

const Input = ({ value, onChange, type = 'text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} />
);

class NodeEditor extends React.Component {
  Item({ decorateHandle, removable, onChange, onRemove, value }) {
    return (
      <div>
        <Input value={value} onChange={onChange} />
        {decorateHandle(
          <span
            style={{
              cursor: 'move',
              margin: '5px',
            }}
          >
            ↕
          </span>
        )}
        <span
          onClick={removable ? onRemove : x => x}
          style={{
            cursor: removable ? 'pointer' : 'not-allowed',
            color: removable ? 'white' : 'gray',
            margin: '5px',
          }}
        >
          X
        </span>
      </div>
    );
  }

  StagingItem({ value, onAdd, canAdd, add, onChange }) {
    return (
      <div>
        <Input value={value} onChange={onChange} />
        <span
          onClick={canAdd ? onAdd : undefined}
          style={{
            color: canAdd ? 'white' : 'gray',
            cursor: canAdd ? 'pointer' : 'not-allowed',
            margin: '5px',
          }}
        >
          Add
        </span>
      </div>
    );
  }

  render() {
    const {
      children,
      onChangeIndex,
      onChangeText,
      onChangeExactMatch,
      onChangeErrorMessageNotMatch,
      onChangeOptions,
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
          <label className="inputList">
            Answer options:
            <ReactListInput
              initialStagingValue=""
              onChange={onChangeOptions}
              maxItems={20}
              minItems={0}
              ItemComponent={this.Item}
              StagingComponent={this.StagingItem}
              value={question.options}
            />
          </label>
          {question.options.length > 0 && (
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
        </form>
      </div>
    );
  }
}

export default NodeEditor;

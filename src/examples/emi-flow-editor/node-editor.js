import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactListInput from 'react-list-input';
import Select from 'react-select';

const Input = ({ value, onChange, type = 'text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} />
);

const question_strs = [
  { value: 'phone', label: 'phone' },
  { value: 'sorted_matches', label: 'sorted_matches' },
  { value: 'best_match_no_retry', label: 'best_match_no_retry' },
  { value: 'best_match', label: 'best_match' },
  { value: 'prepa', label: 'prepa' },
  { value: 'salary', label: 'salary' },
  { value: 'secondary_v2', label: 'secondary_v2' },
  { value: 'nickname', label: 'nickname' },
  { value: 'duration', label: 'duration' },
  { value: 'generic_yes_no_v2', label: 'generic_yes_no_v2' },
  { value: 'welcome_idle', label: 'welcome_idle' },
  { value: 'interest', label: 'interest' },
  { value: 'interest_v2', label: 'interest_v2' },
  { value: 'schedule_v2', label: 'schedule_v2' },
  { value: 'sentiment', label: 'sentiment' },
  { value: 'time_interval', label: 'time_interval' },
  { value: 'datetime', label: 'datetime' },
];

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
      onChangeAI,
      onChangeQuestionStr,
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
            <label>
              AI-Model:
              <Select
                className="questionStrSelectContainer"
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    text: 'orangered',
                    primary25: 'hotpink',
                    neutral0: '#242521',
                    neutral80: 'white',
                  },
                })}
                value={node.gnode.ai.question_str}
                onChange={onChangeQuestionStr}
                options={question_strs}
                isSearchable={true}
              />
            </label>
          )}
        </form>
      </div>
    );
  }
}

export default NodeEditor;

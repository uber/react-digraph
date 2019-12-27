import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactListInput from 'react-list-input';
import Select from 'react-select';

const Input = ({ value, onChange, type = 'text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} />
);

const Item = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
}) {
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
};

const StagingItem = function({ value, onAdd, canAdd, add, onChange }) {
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
};

const selectTheme = function(theme) {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      text: 'orangered',
      primary25: 'hotpink',
      neutral0: '#242521',
      neutral80: 'white',
    },
  };
};

class AiEditor extends React.Component {
  constructor(props) {
    super(props);
    this.questionLabels = {
      phone: 'phone',
      best_match_no_retry: 'best_match_no_retry',
      best_match: 'best_match',
      prepa: 'prepa',
      salary: 'salary',
      secondary_v2: 'secondary_v2',
      nickname: 'nickname',
      duration: 'duration',
      generic_yes_no_v2: 'generic_yes_no_v2',
      welcome_idle: 'welcome_idle',
      interest_v2: 'interest_v2',
      schedule_v2: 'schedule_v2',
      sentiment: 'sentiment',
      time_interval: 'time_interval',
      datetime: 'datetime',
      dates: 'dates',
    };
    this.questionItems = Object.keys(this.questionLabels).map(key =>
      this.getItem(key)
    );
  }

  getItem = key => ({ value: key, label: this.questionLabels[key] });

  render() {
    const {
      children,
      onChangeQuestionStr,
      onChangePredictionDataOptions,
    } = this.props;
    const node = children;
    const ai = node.gnode.ai;

    return (
      <div id="aiEditor">
        <label>
          AI-Model:
          <Select
            className="questionStrSelectContainer"
            theme={selectTheme}
            value={this.getItem(ai.question_str)}
            onChange={onChangeQuestionStr}
            options={this.questionItems}
            isSearchable={true}
          />
        </label>
        {ai.prediction_data &&
          'options' in ai.prediction_data &&
          Object.keys(ai.prediction_data.options).map(key => (
            <label className="inputList" key={key}>
              {key}:
              <ReactListInput
                initialStagingValue=""
                onChange={value => onChangePredictionDataOptions(key, value)}
                maxItems={20}
                minItems={0}
                ItemComponent={Item}
                StagingComponent={StagingItem}
                value={ai.prediction_data.options[key]}
              />
            </label>
          ))}
      </div>
    );
  }
}

class NodeEditor extends React.Component {
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
      onChangePredictionDataOptions,
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

    // console.log(node.gnode);
    // if (node.gnode.ai) {
    //   console.log(node.gnode.ai);
    //   console.log('prediction_data' in node.gnode.ai && 'options' in node.gnode.ai.prediction_data);

    // }

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
              ItemComponent={Item}
              StagingComponent={StagingItem}
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
            <AiEditor
              onChangeQuestionStr={onChangeQuestionStr}
              onChangePredictionDataOptions={onChangePredictionDataOptions}
            >
              {children}
            </AiEditor>
          )}
        </form>
      </div>
    );
  }
}

export default NodeEditor;

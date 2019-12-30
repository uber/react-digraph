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
      this.getQuestionStrItem(key)
    );
    this.langLabels = {
      ES: 'ES',
      ES_419: 'ES_419',
      ES_AR: 'ES_AR',
      ES_MX: 'ES_MX',
    };
    this.langItems = Object.keys(this.langLabels).map(key =>
      this.getLangItem(key)
    );
    this.countryLabels = {
      MX: 'MX',
      AR: 'AR',
    };
    this.countryItems = Object.keys(this.countryLabels).map(key =>
      this.getCountryItem(key)
    );
  }

  getQuestionStrItem = key => ({ value: key, label: this.questionLabels[key] });
  getLangItem = key => ({ value: key, label: this.langLabels[key] });
  getCountryItem = key => ({ value: key, label: this.countryLabels[key] });

  render() {
    const {
      children,
      onChangeQuestionStr,
      onChangePredictionDataOptions,
      onChangeLang,
      onChangeMinSimilarity,
      onChangeIntentResponse,
      onChangeCountry,
    } = this.props;
    const node = children;
    const ai = node.gnode.ai;

    return (
      <div id="aiEditor" className="someNodeEditor">
        <label>
          AI-Model:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={this.getQuestionStrItem(ai.question_str)}
            onChange={onChangeQuestionStr}
            options={this.questionItems}
            isSearchable={true}
          />
        </label>
        {ai.lang && (
          <label>
            Language:
            <Select
              className="selectContainer"
              theme={selectTheme}
              value={this.getLangItem(ai.lang)}
              onChange={onChangeLang}
              options={this.langItems}
              isSearchable={true}
            />
          </label>
        )}
        {ai.country && (
          <label>
            Country:
            <Select
              className="selectContainer"
              theme={selectTheme}
              value={this.getCountryItem(ai.country)}
              onChange={onChangeCountry}
              options={this.countryItems}
              isSearchable={true}
            />
          </label>
        )}
        {ai.prediction_data && 'min_similarity' in ai.prediction_data && (
          <label>
            Min Similarity:
            <input
              type="number"
              name="min_similarity"
              value={ai.prediction_data.min_similarity}
              onChange={onChangeMinSimilarity}
            />
          </label>
        )}
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
        {ai.prediction_data &&
          'intent_responses' in ai.prediction_data &&
          Object.keys(ai.prediction_data.intent_responses).map(key => (
            <label key={key}>
              {key}:
              <input
                type="text"
                name={`intent_response_${key}`}
                value={ai.prediction_data.intent_responses[key]}
                onChange={e => onChangeIntentResponse(key, e.target.value)}
              />
            </label>
          ))}
      </div>
    );
  }
}

class AnswerEditor extends React.Component {
  render() {
    const {
      children,
      onChangeExactMatch,
      onChangeErrorMessageNotMatch,
      onChangeOptions,
      onChangeAI,
      onChangeQuestionStr,
      onChangePredictionDataOptions,
      onChangeLang,
      onChangeMinSimilarity,
      onChangeIntentResponse,
      onChangeCountry,
    } = this.props;
    const node = children;
    const question = node.gnode.question;

    return (
      <div id="answerEditor" className="someNodeEditor">
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
            onChangeLang={onChangeLang}
            onChangeMinSimilarity={onChangeMinSimilarity}
            onChangeIntentResponse={onChangeIntentResponse}
            onChangeCountry={onChangeCountry}
          >
            {children}
          </AiEditor>
        )}
      </div>
    );
  }
}

class EdgeEditor extends React.Component {
  render() {
    const { children, onChangeConn, onMakeDefaultConn } = this.props;
    const edge = children;
    const conns = edge.sourceNode.gnode.question.connections;
    const targetIndex = edge.targetNode.gnode.question.index;
    const conn = conns.find(conn => conn.goto === targetIndex);

    return (
      <div id="edgeEditor" className="someNodeEditor">
        <h1>{`${edge.source} => ${edge.target}`}</h1>
        {conn.isDefault && (
          <label className="defaultConnection">Default connection</label>
        )}
        {conn.isDefault ? (
          <label>
            Click to remove default behavior:
            <input
              name="deafultConn"
              type="button"
              value="Remove default"
              onClick={e => onMakeDefaultConn(false)}
            />
          </label>
        ) : (
          <label>
            Click to make this connection the default one:
            <input
              name="deafultConn"
              type="button"
              value="Make default"
              onClick={e => onMakeDefaultConn(true)}
            />
          </label>
        )}
        <label className="inputList">
          containsAny:
          <ReactListInput
            initialStagingValue=""
            onChange={value => onChangeConn('containsAny', value)}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={conn.containsAny}
          />
        </label>
        <label>
          isString:
          <input
            type="text"
            name="isString"
            value={conn.isString}
            onChange={e => onChangeConn('isString', e.target.value)}
          />
        </label>
        <label>
          isNotString:
          <input
            type="text"
            name="isNotString"
            value={conn.isNotString}
            onChange={e => onChangeConn('isNotString', e.target.value)}
          />
        </label>
        <label>
          lessThan:
          <input
            type="number"
            name="lessThan"
            value={conn.lessThan}
            onChange={e => onChangeConn('lessThan', e.target.value)}
          />
        </label>
        <label>
          greaterThan:
          <input
            type="number"
            name="greaterThan"
            value={conn.greaterThan}
            onChange={e => onChangeConn('greaterThan', e.target.value)}
          />
        </label>
        <label className="inputList">
          inArray:
          <ReactListInput
            initialStagingValue=""
            onChange={value => onChangeConn('inArray', value)}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={conn.inArray}
          />
        </label>
        <label className="inputList">
          notInArray:
          <ReactListInput
            initialStagingValue=""
            onChange={value => onChangeConn('notInArray', value)}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={conn.notInArray}
          />
        </label>
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
      onChangeImmediateNext,
      onChangeExactMatch,
      onChangeErrorMessageNotMatch,
      onChangeOptions,
      onChangeAI,
      onChangeQuestionStr,
      onChangePredictionDataOptions,
      onChangeLang,
      onChangeMinSimilarity,
      onChangeIntentResponse,
      onChangeCountry,
      onMakeFirst,
      onChangeConn,
      onMakeDefaultConn,
    } = this.props;

    if (!children) {
      return (
        <div id="nodeEditor" className="someNodeEditor">
          <h1>Select a node or an edge...</h1>
        </div>
      );
    }

    if (children.source) {
      return (
        <div id="nodeEditor">
          <EdgeEditor
            onChangeConn={onChangeConn}
            onMakeDefaultConn={onMakeDefaultConn}
          >
            {children}
          </EdgeEditor>
        </div>
      );
    }

    const node = children;
    const question = node.gnode.question;

    return (
      <div id="nodeEditor" className="someNodeEditor">
        <h1>{question.index}</h1>
        <form onSubmit={e => e.preventDefault()} className="someNodeEditor">
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
          <label>
            Immediate next:
            <input
              name="immediateNext"
              type="checkbox"
              checked={question.immediateNext}
              onChange={onChangeImmediateNext}
            />
          </label>
          {!question.immediateNext && (
            <AnswerEditor
              onChangeExactMatch={onChangeExactMatch}
              onChangeErrorMessageNotMatch={onChangeErrorMessageNotMatch}
              onChangeOptions={onChangeOptions}
              onChangeAI={onChangeAI}
              onChangeQuestionStr={onChangeQuestionStr}
              onChangePredictionDataOptions={onChangePredictionDataOptions}
              onChangeLang={onChangeLang}
              onChangeMinSimilarity={onChangeMinSimilarity}
              onChangeIntentResponse={onChangeIntentResponse}
              onChangeCountry={onChangeCountry}
            >
              {children}
            </AnswerEditor>
          )}
        </form>
      </div>
    );
  }
}

export default NodeEditor;

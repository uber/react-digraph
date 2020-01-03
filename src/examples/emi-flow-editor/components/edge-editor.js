import * as React from 'react';
import Select from 'react-select';
import ReactListInput from 'react-list-input';
import { Input, getSimpleItem, selectTheme, Item, StagingItem } from './common';

const filterOps = [
  'contains',
  'notcontains',
  'equals',
  'notequals',
  'min',
  'max',
  'in',
  'notin',
];

const isArrayFilterOp = function(op) {
  return ['in', 'notin'].includes(op);
};

const FilterItem = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
  getOptions,
  onChangeArrayFilterValue,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);

  return (
    <div className="filterItem">
      <label>
        <Select
          className="selectContainer"
          theme={selectTheme}
          value={getSimpleItem(value.key)}
          onChange={item => {
            value.key = item.value;
            onChange(value);
          }}
          options={getOptions().map(option => getSimpleItem(option))}
          isSearchable={true}
        />
      </label>
      <label>
        <Select
          className="selectContainer"
          theme={selectTheme}
          value={getSimpleItem(value.op)}
          onChange={item => {
            value.op = item.value;
            onChange(value);
          }}
          options={filterOps.map(op => getSimpleItem(op))}
          isSearchable={true}
        />
      </label>
      {isArrayFilterOp(value.op) ? (
        <label className="inputList">
          <ReactListInput
            initialStagingValue=""
            onChange={list =>
              onChangeArrayFilterValue('answers', value.key, value.op, list)
            }
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={value.value}
          />
        </label>
      ) : (
        <label>
          <Input
            value={value.value}
            onChange={text => {
              value.value = text;
              onChange(value);
            }}
          />
        </label>
      )}
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

const FilterItemHOC = (getOptions, onChangeArrayFilterValue) => props =>
  FilterItem({ ...props, getOptions, onChangeArrayFilterValue });

const StagingFilterItem = function({
  value,
  onAdd,
  canAdd,
  add,
  onChange,
  getOptions,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);
  canAdd = value.key !== null && value.op !== null && value.value;

  return (
    <div className="stagingFilters stagingItem">
      <label>
        Question:
        <Select
          className="selectContainer"
          theme={selectTheme}
          value={getSimpleItem(value.key)}
          onChange={item => {
            value.key = item.value;
            onChange(value);
          }}
          options={getOptions().map(option => getSimpleItem(option))}
          isSearchable={true}
        />
      </label>
      <label>
        Operation:
        <Select
          className="selectContainer"
          theme={selectTheme}
          value={getSimpleItem(value.op)}
          onChange={item => {
            value.op = item.value;
            onChange(value);
          }}
          options={filterOps.map(op => getSimpleItem(op))}
          isSearchable={true}
        />
      </label>
      {isArrayFilterOp(value.op) ? (
        <label className="inputList">
          Value:
          <ReactListInput
            initialStagingValue=""
            onChange={list => {
              value.value = list;
              onChange(value);
            }}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={value.value}
          />
        </label>
      ) : (
        <label>
          Value:
          <Input
            className="stagingTextInput"
            value={value.value}
            onChange={text => {
              value.value = text;
              onChange(value);
            }}
          />
        </label>
      )}
      <span
        onClick={canAdd ? onAdd : undefined}
        style={{
          cursor: canAdd ? 'pointer' : 'not-allowed',
          margin: '5px',
          backgroundColor: canAdd ? 'ivory' : 'grey',
          color: 'black',
          padding: '2px',
          border: '1px solid grey',
          borderRadius: '5px',
          maxWidth: 'fit-content',
        }}
      >
        Add
      </span>
    </div>
  );
};

const StagingFilterItemHOC = getOptions => props =>
  StagingFilterItem({ ...props, getOptions });

const ContextItem = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);

  return (
    <div className="contextItem">
      <label>
        <Input
          value={value.var}
          onChange={text => {
            value.var = text;
            onChange(value);
          }}
        />
      </label>
      =
      <label>
        <Input
          value={value.value}
          onChange={text => {
            value.value = text;
            onChange(value);
          }}
        />
      </label>
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

const StagingContextItem = function({ value, onAdd, canAdd, add, onChange }) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);
  canAdd = value.var !== '' && value.value !== '';

  return (
    <div className="stagingContext stagingItem">
      <label>
        Variable:
        <Input
          value={value.var}
          className="stagingTextInput"
          onChange={text => {
            value.var = text;
            onChange(value);
          }}
        />
      </label>
      <label>
        Value:
        <Input
          className="stagingTextInput"
          value={value.value}
          onChange={text => {
            value.value = text;
            onChange(value);
          }}
        />
      </label>
      <span
        onClick={canAdd ? onAdd : undefined}
        style={{
          cursor: canAdd ? 'pointer' : 'not-allowed',
          margin: '5px',
          backgroundColor: canAdd ? 'ivory' : 'grey',
          color: 'black',
          padding: '2px',
          border: '1px solid grey',
          borderRadius: '5px',
          maxWidth: 'fit-content',
        }}
      >
        Add
      </span>
    </div>
  );
};

class EdgeEditor extends React.Component {
  getFilterItems = filters =>
    Object.keys(filters).map(key => ({
      key: key.substr(0, key.lastIndexOf('_')),
      op: key.substr(key.lastIndexOf('_') + 1),
      value: filters[key],
    }));

  getSetContextItems = context =>
    Object.keys(context).map(key => ({
      var: key,
      value: context[key],
    }));

  getSetContextFromItems = items => {
    const context = {};

    items.forEach(item => {
      context[item.var] = item.value;
    });

    return context;
  };

  render() {
    const {
      children,
      onChangeConn,
      onMakeDefaultConn,
      getFilterAnswers,
      onChangeConnFilters,
      onChangeArrayFilterValue,
    } = this.props;
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
        <label className="inputList">
          answers:
          <ReactListInput
            initialStagingValue={{ key: null, op: null, value: '' }}
            onChange={value => onChangeConnFilters('answers', value)}
            maxItems={20}
            minItems={0}
            ItemComponent={FilterItemHOC(
              getFilterAnswers,
              onChangeArrayFilterValue
            )}
            StagingComponent={StagingFilterItemHOC(getFilterAnswers)}
            value={this.getFilterItems(conn.answers)}
          />
        </label>
        <label className="inputList">
          Set Context:
          <ReactListInput
            initialStagingValue={{ var: '', value: '' }}
            onChange={value =>
              onChangeConn('setContext', this.getSetContextFromItems(value))
            }
            maxItems={20}
            minItems={0}
            ItemComponent={ContextItem}
            StagingComponent={StagingContextItem}
            value={this.getSetContextItems(conn.setContext)}
          />
        </label>
      </div>
    );
  }
}

export default EdgeEditor;

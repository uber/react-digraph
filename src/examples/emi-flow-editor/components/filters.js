import * as React from 'react';
import Select from 'react-select';
import ReactListInput from 'react-list-input';
import {
  Input,
  getSimpleItem,
  selectTheme,
  Item,
  StagingItem,
  StagingItemHOC,
} from './common';

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

const changeFilterOp = (item, value, onChange) => {
  value.op = item.value;

  if (isArrayFilterOp(value.op) && !Array.isArray(value.value)) {
    value.value = [`${value.value}`];
  } else if (!isArrayFilterOp(value.op) && Array.isArray(value.value)) {
    value.value = '';
  }

  onChange(value);
};

const FilterItem = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
  getOptions,
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
          onChange={item => changeFilterOp(item, value, onChange)}
          options={filterOps.map(op => getSimpleItem(op))}
          isSearchable={true}
        />
      </label>
      {isArrayFilterOp(value.op) ? (
        <label className="inputList">
          <ReactListInput
            initialStagingValue=""
            onChange={list => {
              value.value = list;
              onChange(value);
            }}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItemHOC({ style: { display: 'flex' } })}
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

const FilterItemHOC = getOptions => props =>
  FilterItem({ ...props, getOptions });

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
        Key:
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

export { FilterItemHOC, StagingFilterItemHOC, ContextItem, StagingContextItem };

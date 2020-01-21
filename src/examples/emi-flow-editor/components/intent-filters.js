import * as React from 'react';
import Select from 'react-select';
import ReactListInput from 'react-list-input';
import {
  Input,
  getSimpleItem,
  selectTheme,
  StagingSelectItemHOC,
  SelectItemHOC,
} from './common';

const filterOps = [
  // 'contains',
  // 'notcontains',
  'equals',
  'notequals',
  // 'min',
  // 'max',
  'in',
  'notin',
];

const isArrayFilterOp = function(op) {
  return ['in', 'notin'].includes(op);
};

const changeFilterOp = (item, value, onChange) => {
  value.op = item.value;

  if (isArrayFilterOp(value.op) && !Array.isArray(value.value)) {
    value.value = [];
  } else if (!isArrayFilterOp(value.op) && Array.isArray(value.value)) {
    value.value = '';
  }

  onChange(value);
};

const IntentFilterItem = function({
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
        <Input
          style={{ width: '35px' }}
          value={value.key}
          disabled="disabled"
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
            ItemComponent={SelectItemHOC(getOptions)}
            StagingComponent={StagingSelectItemHOC(getOptions)}
            value={value.value}
          />
        </label>
      ) : (
        <label>
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getSimpleItem(value.value)}
            onChange={item => {
              value.value = item.value;
              onChange(value);
            }}
            options={getOptions().map(option => getSimpleItem(option))}
            isSearchable={true}
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

const IntentFilterItemHOC = getOptions => props =>
  IntentFilterItem({ ...props, getOptions });

const StagingIntentFilterItem = function({
  value,
  onAdd,
  canAdd,
  add,
  onChange,
  getOptions,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);
  value.key = 'intent';
  canAdd = value.op !== null && value.value;

  return (
    <div className="stagingFilters stagingItem">
      <label>
        Key:
        <Input
          style={{ width: '35px' }}
          className="stagingTextInput"
          value={value.key}
          disabled="disabled"
        />
      </label>
      <label>
        Operation:
        <Select
          className="selectShortContainer"
          theme={selectTheme}
          value={getSimpleItem(value.op)}
          onChange={item => changeFilterOp(item, value, onChange)}
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
            ItemComponent={SelectItemHOC(getOptions)}
            StagingComponent={StagingSelectItemHOC(getOptions)}
            value={value.value}
          />
        </label>
      ) : (
        <label>
          Value:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getSimpleItem(value.value)}
            onChange={item => {
              value.value = item.value;
              onChange(value);
            }}
            options={getOptions().map(option => getSimpleItem(option))}
            isSearchable={true}
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

const StagingIntentFilterItemHOC = getOptions => props =>
  StagingIntentFilterItem({ ...props, getOptions });

export { IntentFilterItemHOC, StagingIntentFilterItemHOC };

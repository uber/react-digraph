import * as React from 'react';
import Select from 'react-select';
import { Input, getSimpleItem, selectTheme } from './common';

const IntentTranslateItem = function({
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
          value={getSimpleItem(value.intent)}
          onChange={item => {
            value.intent = item.value;
            onChange(value);
          }}
          options={getOptions().map(op => getSimpleItem(op))}
          isSearchable={true}
        />
      </label>
      <Input
        value={value.translation}
        onChange={text => {
          value.translation = text;
          onChange(value);
        }}
      />
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

const IntentTranslateItemHOC = getOptions => props =>
  IntentTranslateItem({ ...props, getOptions });

const StagingIntentTranslateItem = function({
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
  canAdd = value.intent !== null && value.translation;

  return (
    <div className="stagingFilters stagingItem">
      <label>
        Intent:
        <Select
          className="selectContainer"
          theme={selectTheme}
          value={getSimpleItem(value.intent)}
          onChange={item => {
            value.intent = item.value;
            onChange(value);
          }}
          options={getOptions().map(op => getSimpleItem(op))}
          isSearchable={true}
        />
      </label>
      <label>
        Translation:
        <Input
          value={value.translation}
          onChange={text => {
            value.translation = text;
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

const StagingIntentTranslateItemHOC = getOptions => props =>
  StagingIntentTranslateItem({ ...props, getOptions });

export { IntentTranslateItemHOC, StagingIntentTranslateItemHOC };

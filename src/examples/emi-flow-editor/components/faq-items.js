import * as React from 'react';
import ReactListInput from 'react-list-input';
import { Input, Item, StagingItem } from './common';

const FaqItem = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);

  return (
    <div className="filterItem">
      <Input
        value={value.key}
        onChange={text => {
          value.key = text;
          onChange(value);
        }}
      />
      <label className="inputList">
        <ReactListInput
          initialStagingValue=""
          onChange={list => {
            value.messages = list;
            onChange(value);
          }}
          maxItems={20}
          minItems={0}
          ItemComponent={Item}
          StagingComponent={StagingItem}
          value={value.messages}
        />
      </label>
      <label className="inputList">
        <ReactListInput
          initialStagingValue=""
          onChange={list => {
            value.samples = list;
            onChange(value);
          }}
          maxItems={20}
          minItems={0}
          ItemComponent={Item}
          StagingComponent={StagingItem}
          value={value.samples}
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

const StagingFaqItem = function({
  value,
  onAdd,
  canAdd,
  add,
  onChange,
  getOptions,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);
  canAdd = value.key && value.messages.length > 0 && value.samples.length > 0;

  return (
    <div className="stagingFilters stagingItem">
      <label>
        Key:
        <Input
          value={value.key}
          onChange={text => {
            value.key = text;
            onChange(value);
          }}
        />
      </label>
      <label>
        messages:
        <ReactListInput
          initialStagingValue=""
          onChange={list => {
            value.messages = list;
            onChange(value);
          }}
          maxItems={20}
          minItems={0}
          ItemComponent={Item}
          StagingComponent={StagingItem}
          value={value.messages}
        />
      </label>
      <label>
        samples:
        <ReactListInput
          initialStagingValue=""
          onChange={list => {
            value.samples = list;
            onChange(value);
          }}
          maxItems={20}
          minItems={0}
          ItemComponent={Item}
          StagingComponent={StagingItem}
          value={value.samples}
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

export { FaqItem, StagingFaqItem };

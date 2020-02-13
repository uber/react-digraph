import * as React from 'react';
import Select from 'react-select';
import { Input, getSimpleItem, selectTheme } from './common';

const MAX_CHARS = 20;
const POSTBACK = 'postback';
const WEB_URI = 'web_url';
const cardTypes = [POSTBACK, WEB_URI];

const changeType = (value, newType, onChange) => {
  value.type = newType;
  value.url = newType === WEB_URI ? '' : null;
  value.payload = newType === POSTBACK ? '' : null;
  onChange(value);
};

const CardItem = function({
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
        value={value.title}
        onChange={text => {
          if (text.length > MAX_CHARS) {
            return;
          }

          value.title = text;
          onChange(value);
        }}
      />
      <label>
        <Select
          className="selectShortContainer"
          theme={selectTheme}
          value={getSimpleItem(value.type)}
          onChange={item => changeType(value, item.value, onChange)}
          options={cardTypes.map(ct => getSimpleItem(ct))}
          isSearchable={false}
        />
      </label>
      {value.type === WEB_URI && (
        <Input
          value={value.url}
          onChange={text => {
            value.url = text;
            onChange(value);
          }}
        />
      )}
      {value.type === POSTBACK && (
        <Input
          value={value.payload}
          onChange={text => {
            value.payload = text;
            onChange(value);
          }}
        />
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

const StagingCardItem = function({ value, onAdd, canAdd, add, onChange }) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);
  canAdd =
    (value.type === POSTBACK && value.payload) ||
    (value.type === WEB_URI && value.url);

  return (
    <div className="stagingFilters stagingItem">
      <label>
        Title:
        <Input
          value={value.title}
          onChange={text => {
            if (text.length > MAX_CHARS) {
              return;
            }

            value.title = text;
            onChange(value);
          }}
        />
      </label>
      <label>
        Type:
        <Select
          className="selectShortContainer"
          theme={selectTheme}
          value={getSimpleItem(value.type)}
          onChange={item => changeType(value, item.value, onChange)}
          options={cardTypes.map(ct => getSimpleItem(ct))}
          isSearchable={false}
        />
      </label>
      {value.type === WEB_URI && (
        <label>
          url:
          <Input
            value={value.url}
            onChange={text => {
              value.url = text;
              onChange(value);
            }}
          />
        </label>
      )}
      {value.type === POSTBACK && (
        <label>
          payload:
          <Input
            value={value.payload}
            onChange={text => {
              value.payload = text;
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

export { CardItem, StagingCardItem };

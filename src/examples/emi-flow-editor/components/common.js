import * as React from 'react';

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

const getSimpleItem = function(name) {
  return { value: name, label: name };
};

const Input = ({ value, onChange, type = 'text', className = '' }) => (
  <input
    className={className}
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

const Item = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
}) {
  return (
    <div className="listItem">
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
    <div className="stagingItem">
      <Input className="stagingTextInput" value={value} onChange={onChange} />
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

export { selectTheme, getSimpleItem, Input, Item, StagingItem };

import * as React from 'react';
import Select from 'react-select';
import SkeletonLoader from 'tiny-skeleton-loader-react';

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

const getItem = function(value, label) {
  return { value: value, label: label };
};

const formatDate = d =>
  d.getUTCFullYear() +
  '/' +
  ('0' + (d.getUTCMonth() + 1)).slice(-2) +
  '/' +
  ('0' + d.getUTCDate()).slice(-2) +
  ' ' +
  ('0' + d.getUTCHours()).slice(-2) +
  ':' +
  ('0' + d.getUTCMinutes()).slice(-2) +
  ':' +
  ('0' + d.getUTCSeconds()).slice(-2);

const Input = ({
  value,
  onChange,
  type = 'text',
  className = '',
  disabled = '',
  style,
  ...props
}) => (
  <input
    style={style}
    className={className}
    type={type}
    value={value}
    disabled={disabled}
    onChange={e => onChange(e.target.value)}
    {...props}
  />
);

const Button = ({ onClick, children }) => (
  <button className="btn btn-default" onClick={onClick}>
    {children}
  </button>
);

const Item = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
  maxChars,
}) {
  return (
    <div className="listItem">
      <Input
        value={value}
        onChange={v => {
          if (maxChars && v.length > maxChars) {
            return;
          }

          onChange(v);
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

const ItemHOC = ({ maxChars }) => props => Item({ ...props, maxChars });

const StagingItem = function({
  value,
  onAdd,
  canAdd,
  add,
  onChange,
  style,
  maxChars,
}) {
  return (
    <div className="stagingItem" style={style}>
      <Input
        className="stagingTextInput"
        value={value}
        onChange={v => {
          if (maxChars && v.length > maxChars) {
            return;
          }

          onChange(v);
        }}
      />
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

const StagingItemHOC = ({ style, maxChars }) => props =>
  StagingItem({ ...props, style, maxChars });

const SelectItem = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
  getOptions,
}) {
  return (
    <div className="listItem">
      <label>
        <Select
          className="selectContainer"
          theme={selectTheme}
          value={getSimpleItem(value)}
          onChange={item => onChange(item.value)}
          options={getOptions().map(option => getSimpleItem(option))}
          isSearchable={true}
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

const SelectItemHOC = getOptions => props =>
  SelectItem({ ...props, getOptions });

const StagingSelectItem = function({
  value,
  onAdd,
  canAdd,
  add,
  onChange,
  getOptions,
}) {
  return (
    <div className="stagingItem">
      <label style={{ border: 'none' }}>
        Intent:
        <Select
          className="selectContainer"
          theme={selectTheme}
          value={getSimpleItem(value)}
          onChange={item => onChange(item.value)}
          options={getOptions().map(option => getSimpleItem(option))}
          isSearchable={true}
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

const StagingSelectItemHOC = getOptions => props => {
  return StagingSelectItem({ ...props, getOptions });
};

class Loading extends React.Component {
  render() {
    return <SkeletonLoader {...this.props} />;
  }
}

class LoadingWrapper extends React.Component {
  render() {
    const { isLoading, children, ...props } = this.props;

    return <div>{isLoading ? <Loading {...props} /> : children}</div>;
  }
}

export {
  Button,
  selectTheme,
  getSimpleItem,
  getItem,
  formatDate,
  Input,
  Item,
  ItemHOC,
  StagingItemHOC,
  StagingItem,
  SelectItemHOC,
  StagingSelectItemHOC,
  LoadingWrapper,
};

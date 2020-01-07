import * as React from 'react';
import ReactListInput from 'react-list-input';
import Select from 'react-select';
import { selectTheme, getSimpleItem, Item, StagingItem } from './common';

const methods = ['POST', 'PUT', 'GET'];

class ServerEditor extends React.Component {
  render() {
    const {
      children,
      onChangeServerProp,
      onChangeServerIncludeAnswers,
      onChangeServerParam,
      onChangeServerTranslate,
    } = this.props;
    const node = children;
    const question = node.gnode.question;
    const server = node.gnode.server;

    return (
      <div id="serverEditor" className="someNodeEditor">
        <label>
          URL:
          <input
            name="url"
            value={server.url}
            onChange={e => onChangeServerProp('url', e.target.value)}
          />
        </label>
        <label>
          Method:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getSimpleItem(server.method)}
            onChange={item => onChangeServerProp('method', item.value)}
            options={methods.map(method => getSimpleItem(method))}
            isSearchable={true}
          />
        </label>
        <label>
          includeAnswers:
          <input
            name="includeAnswers"
            type="checkbox"
            checked={'includeAnswers' in server}
            onChange={e => onChangeServerIncludeAnswers(e.target.checked)}
          />
        </label>
        {'includeAnswers' in server && (
          <label className="inputList">
            Answers:
            <ReactListInput
              initialStagingValue=""
              onChange={list => onChangeServerProp('includeAnswers', list)}
              maxItems={20}
              minItems={1}
              ItemComponent={Item}
              StagingComponent={StagingItem}
              value={server.includeAnswers}
            />
          </label>
        )}
        {question.quickReplies.length > 0 && (
          <label>
            Send answer as param:
            <input
              name="param"
              value={server.param}
              onChange={e => onChangeServerParam(e.target.value)}
            />
          </label>
        )}
        {server.translate && (
          <label className="translationMap">
            Translate answer:
            {Object.keys(server.translate).map(key => (
              <label key={key}>
                {key}:
                <input
                  name={`param_${key}`}
                  value={server.translate[key]}
                  onChange={e => onChangeServerTranslate(key, e.target.value)}
                />
              </label>
            ))}
          </label>
        )}
      </div>
    );
  }
}

export default ServerEditor;

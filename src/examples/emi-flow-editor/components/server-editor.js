import * as React from 'react';
import ReactListInput from 'react-list-input';
import Select from 'react-select';
import {
  selectTheme,
  getSimpleItem,
  SelectItemHOC,
  StagingSelectItemHOC,
} from './common';

const methods = ['POST', 'PUT', 'GET'];

const getSupportedParams = () => ['candidate_id', 'job_id', 'channel_user_id'];

const getValidParamsHOC = server => () =>
  getSupportedParams().filter(p => !server.params.includes(p));

const getValidIncludeAnswersHOC = (question, server) => () =>
  question.quickReplies.filter(a => !server.includeAnswers.includes(a));

class ServerEditor extends React.Component {
  render() {
    const { children, serverHandlers } = this.props;
    const {
      onChangeServer,
      onChangeServerProp,
      onChangeServerIncludeAnswers,
      onChangeServerParam,
      onChangeServerTranslate,
    } = serverHandlers;
    const node = children;
    const question = node.gnode.question;
    const server = node.gnode.server;

    return (
      <label style={{ display: 'flex', flexDirection: 'column' }}>
        Server request:
        <input
          name="server"
          type="checkbox"
          checked={'server' in node.gnode}
          onChange={e => onChangeServer(e.target.checked)}
        />
        {'server' in node.gnode && (
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
            <label className="inputList">
              Send params:
              <ReactListInput
                initialStagingValue=""
                onChange={list => onChangeServerProp('params', list)}
                maxItems={20}
                minItems={0}
                ItemComponent={SelectItemHOC(getSupportedParams)}
                StagingComponent={StagingSelectItemHOC(
                  getValidParamsHOC(server)
                )}
                value={server.params}
              />
            </label>
            {question.quickReplies.length > 0 && (
              <label>
                includeAnswers:
                <input
                  name="includeAnswers"
                  type="checkbox"
                  checked={'includeAnswers' in server}
                  onChange={e => onChangeServerIncludeAnswers(e.target.checked)}
                />
              </label>
            )}
            {'includeAnswers' in server && (
              <label className="inputList">
                Answers:
                <ReactListInput
                  initialStagingValue=""
                  onChange={list => onChangeServerProp('includeAnswers', list)}
                  maxItems={20}
                  minItems={1}
                  ItemComponent={SelectItemHOC(() => question.quickReplies)}
                  StagingComponent={StagingSelectItemHOC(
                    getValidIncludeAnswersHOC(question, server)
                  )}
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
                      onChange={e =>
                        onChangeServerTranslate(key, e.target.value)
                      }
                    />
                  </label>
                ))}
              </label>
            )}
          </div>
        )}
      </label>
    );
  }
}

export default ServerEditor;

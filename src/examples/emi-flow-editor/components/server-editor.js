import * as React from 'react';
import ReactListInput from 'react-list-input';
import Select from 'react-select';
import {
  selectTheme,
  getSimpleItem,
  SelectItemHOC,
  StagingSelectItemHOC,
} from './common';
import {
  ENDPOINT_TYPE,
  CUSTOM_TYPE,
  ENDPOINTS,
  URL_TYPES,
} from '../flow-defs-api';

const methods = ['POST', 'PUT', 'GET'];

const ENDPOINTS_ITEMS = ENDPOINTS.map(e => ({
  value: `{{${e}}}`,
  label: e,
}));

const getSupportedParams = () => ['candidate_id', 'job_id', 'channel_user_id'];

const getValidParamsHOC = server => () =>
  getSupportedParams().filter(p => !server.params.includes(p));

const getValidIncludeAnswerHOC = (question, server) => () =>
  question.quickReplies.filter(a => !server.includeAnswer.includes(a));

class ServerEditor extends React.Component {
  render() {
    const { children, serverHandlers, parentProp } = this.props;
    const {
      onChangeServer,
      onChangeServerProp,
      onChangeServerIncludeAnswer,
      onChangeServerParam,
      onChangeServerTranslate,
      getServerParent,
      onChangeUrlType,
      getUrlType,
    } = serverHandlers;
    const node = children;
    const question = node.gnode.question;
    const server = getServerParent(parentProp).server;

    return (
      <label style={{ display: 'flex', flexDirection: 'column' }}>
        Server request:
        <input
          name="server"
          type="checkbox"
          checked={server !== undefined}
          onChange={e => onChangeServer(e.target.checked, parentProp)}
        />
        {server !== undefined && (
          <div id="serverEditor" className="someNodeEditor">
            <label>
              URL Type:
              <Select
                className="selectContainer"
                theme={selectTheme}
                value={getSimpleItem(getUrlType(parentProp))}
                onChange={item => onChangeUrlType(item.value, parentProp)}
                options={URL_TYPES.map(type => getSimpleItem(type))}
                isSearchable={false}
              />
            </label>
            {getUrlType(parentProp) === CUSTOM_TYPE && (
              <label>
                URL:
                <input
                  name="url"
                  value={server.url}
                  onChange={e =>
                    onChangeServerProp('url', e.target.value, parentProp)
                  }
                />
              </label>
            )}
            {getUrlType(parentProp) === ENDPOINT_TYPE && (
              <label>
                ENDPOINT:
                <Select
                  className="selectContainer"
                  theme={selectTheme}
                  value={ENDPOINTS_ITEMS.find(i => i.value === server.url)}
                  onChange={item =>
                    onChangeServerProp('url', item.value, parentProp)
                  }
                  options={ENDPOINTS_ITEMS}
                  isSearchable={false}
                />
              </label>
            )}
            <label>
              Method:
              <Select
                className="selectContainer"
                theme={selectTheme}
                value={getSimpleItem(server.method)}
                onChange={item =>
                  onChangeServerProp('method', item.value, parentProp)
                }
                options={methods.map(method => getSimpleItem(method))}
                isSearchable={true}
              />
            </label>
            <label className="inputList">
              Send params:
              <ReactListInput
                initialStagingValue=""
                onChange={list =>
                  onChangeServerProp('params', list, parentProp)
                }
                maxItems={20}
                minItems={0}
                ItemComponent={SelectItemHOC(getValidParamsHOC(server))}
                StagingComponent={StagingSelectItemHOC(
                  getValidParamsHOC(server)
                )}
                value={server.params}
              />
            </label>
            {question.quickReplies.length > 0 && (
              <label>
                includeAnswer:
                <input
                  name="includeAnswer"
                  type="checkbox"
                  checked={'includeAnswer' in server}
                  onChange={e =>
                    onChangeServerIncludeAnswer(e.target.checked, parentProp)
                  }
                />
              </label>
            )}
            {'includeAnswer' in server && (
              <label className="inputList">
                Answers:
                <ReactListInput
                  initialStagingValue=""
                  onChange={list =>
                    onChangeServerProp('includeAnswer', list, parentProp)
                  }
                  maxItems={20}
                  minItems={1}
                  ItemComponent={SelectItemHOC(() => question.quickReplies)}
                  StagingComponent={StagingSelectItemHOC(
                    getValidIncludeAnswerHOC(question, server)
                  )}
                  value={server.includeAnswer}
                />
              </label>
            )}
            {question.quickReplies.length > 0 && (
              <label>
                Send answer as param:
                <input
                  name="param"
                  value={server.param}
                  onChange={e =>
                    onChangeServerParam(e.target.value, parentProp)
                  }
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
                        onChangeServerTranslate(key, e.target.value, parentProp)
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

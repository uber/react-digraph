import * as React from 'react';
import ReactListInput from 'react-list-input';
import Select from 'react-select';
import GraphUtils from '../../../utilities/graph-util';
import ServerEditor from './server-editor';
import { selectTheme, getSimpleItem, Item, StagingItem } from './common';
import {
  StagingIntentTranslateItemHOC,
  IntentTranslateItemHOC,
} from './intent-translate';
import {
  intentsByQuestionStr,
  questionStrItems,
  langItems,
  countryItems,
  deprecatedQuestionStrs,
} from '../empathy.js';

const getSupportedIntents = ai => intentsByQuestionStr[ai.question_str];

const getValidIntentsHOC = ai => () =>
  getSupportedIntents(ai).filter(
    i => !Object.keys(ai.prediction_data.intent_responses).includes(i)
  );

class AiEditor extends React.Component {
  getIntentTranslateItems = intent_responses =>
    Object.keys(intent_responses).map(key => ({
      intent: key,
      translation: intent_responses[key],
    }));

  getIntentTranslateFromItems = items => {
    const intent_responses = {};

    items.forEach(item => {
      intent_responses[item.intent] = item.translation;
    });

    return intent_responses;
  };

  getFilterFromItems = items => {
    const filters = {};

    items.forEach(item => {
      const key = `${item.key}_${item.op}`;

      filters[key] = item.value;
    });

    return filters;
  };

  modelClasses = ai =>
    GraphUtils.classNames(
      deprecatedQuestionStrs.includes(ai.question_str) ? ['deprecated'] : []
    );

  render() {
    const { children, aiHandlers } = this.props;
    const {
      onChangeAI,
      onChangeAiQuestionStr,
      onChangePredictionDataOptions,
      onChangeLang,
      onChangeMinSimilarity,
      onChangeIntentResponses,
      onChangeCountry,
      aiServerHandlers,
    } = aiHandlers;
    const node = children;
    const ai = node.gnode.ai;

    return (
      <label style={{ display: 'flex', flexDirection: 'column' }}>
        AI - Empathy:
        <input
          name="ai"
          type="checkbox"
          checked={'ai' in node.gnode}
          onChange={e => onChangeAI(e.target.checked)}
        />
        {'ai' in node.gnode && (
          <div id="aiEditor" className="someNodeEditor">
            <label className={this.modelClasses(ai)}>
              AI-Model:
              <Select
                className="selectContainer"
                theme={selectTheme}
                value={getSimpleItem(ai.question_str)}
                onChange={onChangeAiQuestionStr}
                options={questionStrItems}
                isSearchable={true}
              />
            </label>
            {ai.lang && (
              <label>
                Language:
                <Select
                  className="selectContainer"
                  theme={selectTheme}
                  value={getSimpleItem(ai.lang)}
                  onChange={onChangeLang}
                  options={langItems}
                  isSearchable={true}
                />
              </label>
            )}
            {ai.country && (
              <label>
                Country:
                <Select
                  className="selectContainer"
                  theme={selectTheme}
                  value={getSimpleItem(ai.country)}
                  onChange={onChangeCountry}
                  options={countryItems}
                  isSearchable={true}
                />
              </label>
            )}
            {ai.prediction_data && 'min_similarity' in ai.prediction_data && (
              <label>
                Min Similarity:
                <input
                  type="number"
                  name="min_similarity"
                  value={ai.prediction_data.min_similarity}
                  onChange={e => onChangeMinSimilarity(e.target.value)}
                />
              </label>
            )}
            {ai.prediction_data &&
              'options' in ai.prediction_data &&
              Object.keys(ai.prediction_data.options).map(key => (
                <label className="inputList" key={key}>
                  {key}:
                  <ReactListInput
                    initialStagingValue=""
                    onChange={value =>
                      onChangePredictionDataOptions(key, value)
                    }
                    maxItems={20}
                    minItems={0}
                    ItemComponent={Item}
                    StagingComponent={StagingItem}
                    value={ai.prediction_data.options[key]}
                  />
                </label>
              ))}
            {ai.prediction_data && 'intent_responses' in ai.prediction_data && (
              <label className="inputList">
                Intent translation:
                <ReactListInput
                  initialStagingValue={{ intent: null, translation: '' }}
                  onChange={value =>
                    onChangeIntentResponses(
                      this.getIntentTranslateFromItems(value)
                    )
                  }
                  maxItems={20}
                  minItems={0}
                  ItemComponent={IntentTranslateItemHOC(getValidIntentsHOC(ai))}
                  StagingComponent={StagingIntentTranslateItemHOC(
                    getValidIntentsHOC(ai)
                  )}
                  value={this.getIntentTranslateItems(
                    ai.prediction_data.intent_responses
                  )}
                />
              </label>
            )}
            <ServerEditor serverHandlers={aiServerHandlers} parentProp="ai">
              {children}
            </ServerEditor>
          </div>
        )}
      </label>
    );
  }
}

export default AiEditor;

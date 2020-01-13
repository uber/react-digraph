import * as React from 'react';
import ReactListInput from 'react-list-input';
import Select from 'react-select';
import ServerEditor from './server-editor';
import { selectTheme, Item, StagingItem } from './common';
import {
  StagingIntentTranslateItemHOC,
  IntentTranslateItemHOC,
} from './intent-translate';
import { intentsByQuestionStr } from '../empathy.js';

const getSupportedIntents = ai => intentsByQuestionStr[ai.question_str];

const getValidIntentsHOC = ai => () =>
  getSupportedIntents(ai).filter(
    i => !Object.keys(ai.prediction_data.intent_responses).includes(i)
  );

class AiEditor extends React.Component {
  constructor(props) {
    super(props);
    this.questionLabels = {
      phone: 'phone',
      best_match_no_retry: 'best_match_no_retry',
      best_match: 'best_match',
      prepa: 'prepa',
      salary: 'salary',
      secondary_v2: 'secondary_v2',
      nickname: 'nickname',
      duration: 'duration',
      generic_yes_no_v2: 'generic_yes_no_v2',
      welcome_idle: 'welcome_idle',
      interest_v2: 'interest_v2',
      schedule_v2: 'schedule_v2',
      sentiment: 'sentiment',
      time_interval: 'time_interval',
      datetime: 'datetime',
      dates: 'dates',
    };
    this.questionItems = Object.keys(this.questionLabels).map(key =>
      this.getQuestionStrItem(key)
    );
    this.langLabels = {
      ES: 'ES',
      ES_419: 'ES_419',
      ES_AR: 'ES_AR',
      ES_MX: 'ES_MX',
    };
    this.langItems = Object.keys(this.langLabels).map(key =>
      this.getLangItem(key)
    );
    this.countryLabels = {
      MX: 'MX',
      AR: 'AR',
    };
    this.countryItems = Object.keys(this.countryLabels).map(key =>
      this.getCountryItem(key)
    );
  }

  getQuestionStrItem = key => ({ value: key, label: this.questionLabels[key] });
  getLangItem = key => ({ value: key, label: this.langLabels[key] });
  getCountryItem = key => ({ value: key, label: this.countryLabels[key] });

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
            <label>
              AI-Model:
              <Select
                className="selectContainer"
                theme={selectTheme}
                value={this.getQuestionStrItem(ai.question_str)}
                onChange={onChangeAiQuestionStr}
                options={this.questionItems}
                isSearchable={true}
              />
            </label>
            {ai.lang && (
              <label>
                Language:
                <Select
                  className="selectContainer"
                  theme={selectTheme}
                  value={this.getLangItem(ai.lang)}
                  onChange={onChangeLang}
                  options={this.langItems}
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
                  value={this.getCountryItem(ai.country)}
                  onChange={onChangeCountry}
                  options={this.countryItems}
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

import * as React from 'react';
import ReactListInput from 'react-list-input';
import Select from 'react-select';
import { selectTheme, getSimpleItem } from './common';
import { langItems } from '../empathy.js';
import { FaqItem, StagingFaqItem } from './faq-items';

class FaqEditor extends React.Component {
  getOptionsFromItems = items => {
    const options = {};

    items.forEach(item => {
      options[item.key] = {
        actions: {
          action: 'respondMessage',
          messages: item.messages,
        },
        samples: item.samples,
      };
    });

    return options;
  };

  getOptionItems = options =>
    Object.keys(options).map(key => ({
      key: key,
      messages: options[key].actions.messages,
      samples: options[key].samples,
    }));

  render() {
    const { faqHandlers } = this.props;
    const {
      onEnableFaqs,
      getFaqs,
      onChangeFaqsLang,
      onChangeFaqsMinSimilarity,
      onChangeFaqOptions,
    } = faqHandlers;
    const faqs = getFaqs();

    return (
      <div id="faqEditor" className="rightEditor">
        <h1>FAQs</h1>
        <label style={{ flexGrow: 0 }}>
          Enable FAQs:
          <input
            name="faqsEnabled"
            type="checkbox"
            checked={faqs ? true : false}
            onChange={e => onEnableFaqs(e.target.checked)}
          />
        </label>
        {faqs && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>
              Language:
              <Select
                className="selectContainer"
                theme={selectTheme}
                value={getSimpleItem(faqs.lang)}
                onChange={onChangeFaqsLang}
                options={langItems}
                isSearchable={true}
              />
            </label>
            <label>
              Min Similarity:
              <input
                type="number"
                name="min_similarity"
                value={faqs.min_similarity}
                onChange={e => onChangeFaqsMinSimilarity(e.target.value)}
              />
            </label>
            <label className="inputList">
              faqs:
              <ReactListInput
                initialStagingValue={{ key: '', messages: [], samples: [] }}
                onChange={value =>
                  onChangeFaqOptions(this.getOptionsFromItems(value))
                }
                maxItems={20}
                minItems={0}
                ItemComponent={FaqItem}
                StagingComponent={StagingFaqItem}
                value={this.getOptionItems(faqs.options)}
              />
            </label>
          </div>
        )}
      </div>
    );
  }
}

export default FaqEditor;

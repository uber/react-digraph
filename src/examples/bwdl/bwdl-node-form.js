// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as React from 'react';

type IBwdlNodeFormProps = {
  bwdlNode: any,
  bwdlNodeKey: string,
  nextChoices: string[],
};

class BwdlNodeForm extends React.Component<IBwdlNodeFormProps> {
  renderNextOptions(value: any) {
    const { nextChoices } = this.props;

    // This function is defined and used locally to avoid tslint's jsx-no-lambda error.
    // It requires the local value variable, so it cannot be defined in the class.
    const handleChange = (event: any) => {
      event.target.value = value;
    };

    return (
      <select defaultValue={value} onChange={handleChange}>
        {nextChoices.map(choice => {
          return <option key={choice}>{choice}</option>;
        })}
      </select>
    );
  }

  renderAndObjectArray(andObjectArray: any[]) {
    return andObjectArray.map((andObject, index) => {
      return (
        <div className="and-object" key={index}>
          {Object.keys(andObject).map(key => {
            return (
              <div className="and-object-value" key={key}>
                <label>{key}:</label> {this.renderKey(key, andObject[key])}
              </div>
            );
          })}
        </div>
      );
    });
  }

  renderChoicesOptions(value: any) {
    return value.map((choice, index) => {
      return (
        <div key={index} className="choices">
          {Object.keys(choice).map(choiceOption => {
            if (choiceOption === 'Next') {
              // "Next" option
              return (
                <div key={choiceOption}>
                  <label>Next:</label>{' '}
                  {this.renderNextOptions(choice[choiceOption])}
                </div>
              );
            } else if (Array.isArray(choice[choiceOption])) {
              // "And" array
              return (
                <div key={choiceOption}>
                  <label>{choiceOption}:</label>{' '}
                  {this.renderAndObjectArray(choice[choiceOption])}
                </div>
              );
            }

            // text option
            return (
              <div key={choiceOption}>
                <label>{choiceOption}:</label> {choice[choiceOption]}
              </div>
            );
          })}
        </div>
      );
    });
  }

  renderKey(key: string, value: any) {
    if (key === 'Next') {
      return this.renderNextOptions(value);
    } else if (key === 'Choices') {
      return this.renderChoicesOptions(value);
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).map(valueKey => {
        return (
          <div key={valueKey} className="node-property node-sub-property">
            <label>{valueKey}:</label>{' '}
            {this.renderKey(valueKey, value[valueKey])}
          </div>
        );
      });
    }

    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }

  render() {
    const { bwdlNode, bwdlNodeKey } = this.props;

    return (
      <div>
        <h2>{bwdlNodeKey}</h2>
        {Object.keys(bwdlNode).map(key => {
          return (
            <div key={key} className="node-property">
              <label>{key}:</label> {this.renderKey(key, bwdlNode[key])}
            </div>
          );
        })}
      </div>
    );
  }
}

export default BwdlNodeForm;

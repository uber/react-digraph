import * as React from 'react';
import ReactListInput from 'react-list-input';
import { Item, StagingItem } from './common';
import {
  FilterItemHOC,
  StagingFilterItemHOC,
  ContextItem,
  StagingContextItem,
} from './filters.js';
import {
  IntentFilterItemHOC,
  StagingIntentFilterItemHOC,
} from './intent-filters';

class EdgeEditor extends React.Component {
  getFilterItems = filters =>
    Object.keys(filters).map(key => ({
      key: key.substr(0, key.lastIndexOf('_')),
      op: key.substr(key.lastIndexOf('_') + 1),
      value: filters[key],
    }));

  getFilterFromItems = items => {
    const filters = {};

    items.forEach(item => {
      const key = `${item.key}_${item.op}`;

      filters[key] = item.value;
    });

    return filters;
  };

  getSetContextItems = context =>
    Object.keys(context).map(key => ({
      var: key,
      value: context[key],
    }));

  getSetContextFromItems = items => {
    const context = {};

    items.forEach(item => {
      context[item.var] = item.value;
    });

    return context;
  };

  render() {
    const {
      children,
      onChangeConn,
      onMakeDefaultConn,
      getPrevIndexes,
      getPrevContextVars,
      getIntents,
    } = this.props;
    const edge = children;
    const conns = edge.sourceNode.gnode.question.connections;
    const targetIndex = edge.targetNode.gnode.question.index;
    const conn = conns.find(conn => conn.goto === targetIndex);
    const ai = edge.sourceNode.gnode.ai;
    const hasIntents =
      ai && ai.prediction_data && ai.prediction_data.intent_responses;

    return (
      <div id="edgeEditor" className="someNodeEditor">
        <h1>{`${edge.source} => ${edge.target}`}</h1>
        {conn.isDefault && (
          <label className="defaultConnection">Default connection</label>
        )}
        {conn.isDefault ? (
          <label>
            Click to remove default behavior:
            <input
              name="deafultConn"
              type="button"
              value="Remove default"
              onClick={e => onMakeDefaultConn(false)}
            />
          </label>
        ) : (
          <label>
            Click to make this connection the default one:
            <input
              name="deafultConn"
              type="button"
              value="Make default"
              onClick={e => onMakeDefaultConn(true)}
            />
          </label>
        )}
        <label className="inputList">
          containsAny:
          <ReactListInput
            initialStagingValue=""
            onChange={value => onChangeConn('containsAny', value)}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={conn.containsAny}
          />
        </label>
        <label>
          isString:
          <input
            type="text"
            name="isString"
            value={conn.isString}
            onChange={e => onChangeConn('isString', e.target.value)}
          />
        </label>
        <label>
          isNotString:
          <input
            type="text"
            name="isNotString"
            value={conn.isNotString}
            onChange={e => onChangeConn('isNotString', e.target.value)}
          />
        </label>
        <label>
          lessThan:
          <input
            type="number"
            name="lessThan"
            value={conn.lessThan}
            onChange={e => onChangeConn('lessThan', e.target.value)}
          />
        </label>
        <label>
          greaterThan:
          <input
            type="number"
            name="greaterThan"
            value={conn.greaterThan}
            onChange={e => onChangeConn('greaterThan', e.target.value)}
          />
        </label>
        <label className="inputList">
          inArray:
          <ReactListInput
            initialStagingValue=""
            onChange={value => onChangeConn('inArray', value)}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={conn.inArray}
          />
        </label>
        <label className="inputList">
          notInArray:
          <ReactListInput
            initialStagingValue=""
            onChange={value => onChangeConn('notInArray', value)}
            maxItems={20}
            minItems={0}
            ItemComponent={Item}
            StagingComponent={StagingItem}
            value={conn.notInArray}
          />
        </label>
        {hasIntents && (
          <label className="inputList">
            nlp:
            <ReactListInput
              initialStagingValue={{ key: null, op: null, value: '' }}
              onChange={value =>
                onChangeConn('nlp', this.getFilterFromItems(value))
              }
              maxItems={20}
              minItems={0}
              ItemComponent={IntentFilterItemHOC(getIntents)}
              StagingComponent={StagingIntentFilterItemHOC(getIntents)}
              value={this.getFilterItems(conn.nlp)}
            />
          </label>
        )}
        <label className="inputList">
          answers:
          <ReactListInput
            initialStagingValue={{ key: null, op: null, value: '' }}
            onChange={value =>
              onChangeConn('answers', this.getFilterFromItems(value))
            }
            maxItems={20}
            minItems={0}
            ItemComponent={FilterItemHOC(getPrevIndexes)}
            StagingComponent={StagingFilterItemHOC(getPrevIndexes)}
            value={this.getFilterItems(conn.answers)}
          />
        </label>
        <label className="inputList">
          context:
          <ReactListInput
            initialStagingValue={{ key: null, op: null, value: '' }}
            onChange={value =>
              onChangeConn('context', this.getFilterFromItems(value))
            }
            maxItems={20}
            minItems={0}
            ItemComponent={FilterItemHOC(getPrevContextVars)}
            StagingComponent={StagingFilterItemHOC(getPrevContextVars)}
            value={this.getFilterItems(conn.context)}
          />
        </label>
        <label className="inputList">
          Set Context:
          <ReactListInput
            initialStagingValue={{ var: '', value: '' }}
            onChange={value =>
              onChangeConn('setContext', this.getSetContextFromItems(value))
            }
            maxItems={20}
            minItems={0}
            ItemComponent={ContextItem}
            StagingComponent={StagingContextItem}
            value={this.getSetContextItems(conn.setContext)}
          />
        </label>
      </div>
    );
  }
}

export default EdgeEditor;

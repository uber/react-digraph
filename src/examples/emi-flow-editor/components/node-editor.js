import * as React from 'react';
import Select from 'react-select';

import { CHOICE_TYPE, MODULE_TYPE } from '../bwdl-config';
import { selectTheme, getItem } from './common';
import QuestionEditor from './question-editor';
import IndexInput from './index-input';
import ModuleImportEditor from './module-import-editor';

const nodeTypes = {
  [CHOICE_TYPE]: 'Question',
  [MODULE_TYPE]: 'Module',
};

const getNodeTypeItem = value => getItem(value, nodeTypes[value]);

const nodeTypesItems = Object.keys(nodeTypes).map(k => getNodeTypeItem(k));

class NodeEditor extends React.Component {
  render() {
    const { children, nodeHandlers } = this.props;
    const {
      questionHandlers,
      moduleInputHandlers,
      onChangeIndex,
      onMakeFirst,
      onChangeNodeType,
    } = nodeHandlers;
    const node = children;
    const question = node.gnode.question;
    const type = node.gnode.Type;

    return (
      <div id="nodeEditor" className="rightEditor">
        <h1>{question.index}</h1>
        <label>
          Node Type:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getNodeTypeItem(type)}
            onChange={item => onChangeNodeType(item.value)}
            options={nodeTypesItems}
            isSearchable={true}
          />
        </label>
        <form onSubmit={e => e.preventDefault()}>
          {node.first ? (
            <label>First flow node.</label>
          ) : (
            <label>
              Click to make this node the first of the flow:
              <input
                name="first"
                type="button"
                value="Make first"
                onClick={onMakeFirst}
              />
            </label>
          )}
          <IndexInput onChangeIndex={onChangeIndex}>{question}</IndexInput>
          {type === MODULE_TYPE ? (
            <ModuleImportEditor moduleInputHandlers={moduleInputHandlers}>
              {node}
            </ModuleImportEditor>
          ) : (
            <QuestionEditor questionHandlers={questionHandlers}>
              {node}
            </QuestionEditor>
          )}
        </form>
      </div>
    );
  }
}

export default NodeEditor;

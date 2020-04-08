import * as React from 'react';
import debounce from 'debounce';

import ModuleImportComponent from './module-import-component';
import IndexInput from './index-input';
import { Input } from './common';

class ModuleNodeEditor extends React.Component {
  constructor(props) {
    super(props);

    const { children, moduleNodeHandlers } = props;
    const { prefix } = children.gnode;
    const { onChangeModulePrefix } = moduleNodeHandlers;

    this.state = { newPrefix: prefix };
    this.onChangeModulePrefix = debounce(onChangeModulePrefix, 250);
  }

  onChangeNewPrefix = newPrefix => {
    this.setState({ newPrefix });
    this.onChangeModulePrefix(newPrefix);
  };

  render() {
    const { newPrefix } = this.state;
    const { moduleNodeHandlers, children } = this.props;
    const {
      getModules,
      parseImportPath,
      importModule,
      getModuleDef,
      onChangeIndex,
    } = moduleNodeHandlers;
    const node = children;
    const { question, importPath, slots, slotContextVars } = node.gnode;

    return (
      <div id="moduleNodeEditor" className="rightEditor">
        <ModuleImportComponent
          importPath={importPath}
          getModules={getModules}
          parseImportPath={parseImportPath}
          getModuleDef={getModuleDef}
          importModule={importModule}
        />
        <IndexInput onChangeIndex={onChangeIndex}>{question.index}</IndexInput>
        <label>
          Prefix:
          <Input value={newPrefix} onChange={this.onChangeNewPrefix} />
        </label>
        {slots && (
          <label>
            Slots:
            <ul>
              {slots.forEach(s => (
                <li>{s}</li>
              ))}
            </ul>
          </label>
        )}
        {slotContextVars && (
          <label>
            Slot Context Vars:
            <ul>
              {slotContextVars.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </label>
        )}
      </div>
    );
  }
}

export default ModuleNodeEditor;

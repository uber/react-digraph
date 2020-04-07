import * as React from 'react';

import ModuleImportComponent from './module-import-component';
import IndexInput from './index-input';
import { Input } from './common';

class ModuleNodeEditor extends React.Component {
  render() {
    const { moduleNodeHandlers, children } = this.props;
    const {
      getModules,
      parseImportPath,
      importModule,
      getModuleDef,
      onChangeIndex,
      onChangeModulePrefix,
    } = moduleNodeHandlers;
    const node = children;
    const { question, importPath, prefix, slots, slotContextVars } = node.gnode;

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
          <Input value={prefix} onChange={onChangeModulePrefix} />
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

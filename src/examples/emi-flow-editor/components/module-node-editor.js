import * as React from 'react';

import ModuleImportComponent from './module-import-component';

class ModuleNodeEditor extends React.Component {
  render() {
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
      <div id="moduleImportEditor" className="rightEditor">
        <ModuleImportComponent
          index={question.index}
          importPath={importPath}
          slots={slots}
          slotContextVars={slotContextVars}
          getModules={getModules}
          parseImportPath={parseImportPath}
          getModuleDef={getModuleDef}
          importModule={importModule}
          onChangeIndex={onChangeIndex}
        />
      </div>
    );
  }
}

export default ModuleNodeEditor;

import * as React from 'react';

import ModuleImportComponent from './module-import-component';

class ModuleImportEditor extends React.Component {
  render() {
    const { moduleInputHandlers, children } = this.props;
    const {
      getModules,
      parseImportPath,
      importModule,
      getModuleDef,
    } = moduleInputHandlers;
    const node = children;
    const { importPath, slots, slotContextVars } = node.gnode;

    return (
      <div id="moduleImportEditor" className="rightEditor">
        <ModuleImportComponent
          importPath={importPath}
          slots={slots}
          slotContextVars={slotContextVars}
          getModules={getModules}
          parseImportPath={parseImportPath}
          getModuleDef={getModuleDef}
          importModule={importModule}
        />
      </div>
    );
  }
}

export default ModuleImportEditor;

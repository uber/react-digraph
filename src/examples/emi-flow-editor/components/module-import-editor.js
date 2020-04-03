import * as React from 'react';

import ModuleImportComponent from './module-import-component';

class ModuleImportEditor extends React.Component {
  render() {
    const { moduleInputHandlers, children } = this.props;
    const { getModules } = moduleInputHandlers;
    const node = children;
    const { modulePath } = node.gnode;

    return (
      <div id="moduleImportEditor" className="rightEditor">
        <ModuleImportComponent
          modulePath={modulePath}
          getModules={getModules}
        />
      </div>
    );
  }
}

export default ModuleImportEditor;

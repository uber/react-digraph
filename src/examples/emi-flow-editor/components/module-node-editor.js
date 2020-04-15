import * as React from 'react';
import debounce from 'debounce';
import { withAlert } from 'react-alert';

import ModuleImportComponent from './module-import-component';
import IndexInput from './index-input';
import { Input, getErrorMessage } from './common';

class ModuleNodeEditor extends React.Component {
  constructor(props) {
    super(props);

    const { children, moduleNodeHandlers } = props;
    const { prefix } = children.gnode;
    const { onChangeModulePrefix } = moduleNodeHandlers;

    this.state = { newPrefix: prefix };
    this.onChangeModulePrefix = debounce(onChangeModulePrefix, 250);
  }

  static getDerivedStateFromProps(props, state) {
    const { children, moduleNodeHandlers, alert } = props;
    const { importPath } = children.gnode;

    if (state.importPath != importPath) {
      const { parseImportPath } = moduleNodeHandlers;
      const { importPathError } = state;

      try {
        const { name, version } = parseImportPath(importPath);

        alert.remove(importPathError);

        return { importPath, name, version };
      } catch (err) {
        const importPathError = alert.error(
          `Couldn't parse module import path: ${getErrorMessage(err)}`
        );

        return { importPathError, importPath, name: null, version: null };
      }
    }

    return null;
  }

  onChangeNewPrefix = newPrefix => {
    this.setState({ newPrefix });
    this.onChangeModulePrefix(newPrefix);
  };

  render() {
    const { newPrefix, name, version } = this.state;
    const { moduleNodeHandlers, children } = this.props;
    const {
      getModuleDefs,
      importModule,
      getModuleDef,
      getModuleOutput,
      onChangeIndex,
      getLatestVersionModuleDef,
    } = moduleNodeHandlers;
    const node = children;
    const { question, importPath, slotContextVars } = node.gnode;

    return (
      <div id="moduleNodeEditor" className="rightEditor">
        <ModuleImportComponent
          importPath={importPath}
          getModuleDefs={getModuleDefs}
          name={name}
          version={version}
          getModuleDef={getModuleDef}
          importModule={importModule}
          getLatestVersionModuleDef={getLatestVersionModuleDef}
          getModuleOutput={getModuleOutput}
          slotContextVars={slotContextVars}
        />
        <IndexInput onChangeIndex={onChangeIndex}>{question.index}</IndexInput>
        <label>
          Prefix:
          <Input value={newPrefix} onChange={this.onChangeNewPrefix} />
        </label>
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

export default withAlert()(ModuleNodeEditor);

import * as React from 'react';
import Select from 'react-select';
import { withAlert } from 'react-alert';

import {
  selectTheme,
  getSimpleItem,
  LoadingWrapper,
  getErrorMessage,
} from './common';

class ModuleImportComponent extends React.Component {
  constructor(props) {
    super(props);

    this.alert = this.props.alert;
    this.state = {
      s3Loading: false,
      moduleItems: [],
      modulesDict: {},
      showModuleSelect: false,
    };
  }

  _reloadModules = () => {
    this.setState({
      s3Loading: true,
    });

    return this.props
      .getModules()
      .then(modules => {
        this.setState({
          modulesDict: modules,
          moduleItems: Object.keys(modules).map(m => getSimpleItem(m)),
          s3Loading: false,
        });
      })
      .catch(err => {
        this.setState({
          s3Loading: false,
          modules: [],
        });
        this.alert.error(`Couldn't retrieve modules: ${getErrorMessage(err)}`);
      });
  };

  _importModule = (name, version) => {
    const { modulesDict } = this.state;
    const { importModule, getModuleDef } = this.props;

    importModule(getModuleDef(modulesDict, name, version))
      .catch(err => {
        this.alert.error(`Couldn't import module: ${getErrorMessage(err)}`);
      })
      .finally(() => {
        this.setState({
          showModuleSelect: false,
        });
      });
  };

  onShowModuleSelectClick = () => {
    this.setState(prevState => ({
      showModuleSelect: !prevState.showModuleSelect,
    }));
    this._reloadModules();
  };

  render() {
    const { s3Loading, moduleItems, showModuleSelect } = this.state;
    const { parseImportPath, importPath } = this.props;

    const { name, version } = parseImportPath(importPath);

    return (
      <div id="moduleImportComponent">
        <label>
          <h2>Module: {name && !showModuleSelect ? name : ''}</h2>
          <input
            name="changeModule"
            type="button"
            value={`${
              showModuleSelect ? 'Cancel' : name ? 'Change' : 'Select'
            }`}
            onClick={this.onShowModuleSelectClick}
          />
          {showModuleSelect && (
            <label style={{ display: 'flex', border: 'none' }}>
              <LoadingWrapper isLoading={s3Loading} width="300px" height="40px">
                <Select
                  className="selectLongContainer"
                  theme={selectTheme}
                  value=""
                  onChange={item => this._importModule(item.value)}
                  options={moduleItems}
                  isSearchable={true}
                />
              </LoadingWrapper>
            </label>
          )}
        </label>
        <label>
          <h3>Version: {version ? version : ''}</h3>
        </label>
      </div>
    );
  }
}

export default withAlert()(ModuleImportComponent);

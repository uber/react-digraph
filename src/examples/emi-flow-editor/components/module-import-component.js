import * as React from 'react';
import Select from 'react-select';
import { withAlert } from 'react-alert';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import FlowDiff from './flow-diff';

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

  componentDidMount() {
    const { name } = this.props;

    if (name) {
      this._setLatestVersionIntoState();
    }

    this.setState({ name });
  }

  componentDidUpdate() {
    const { name } = this.props;

    if (name != this.state.name) {
      if (name) {
        this._setLatestVersionIntoState();
      }

      this.setState({ name });
    }
  }

  _setLatestVersionIntoState = () => {
    const { name, getLatestVersionModuleDef } = this.props;

    return getLatestVersionModuleDef(name)
      .then(latestVersionModuleDef => this.setState({ latestVersionModuleDef }))
      .catch(err =>
        this.alert.error(
          `Couldn't fetch module versions: ${getErrorMessage(err)}`
        )
      );
  };

  _reloadModules = () => {
    this.setState({
      s3Loading: true,
    });

    return this.props
      .getModuleDefs()
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

  _importModule = moduleDef => {
    const { importModule } = this.props;

    return importModule(moduleDef).catch(err => {
      this.alert.error(`Couldn't import module: ${getErrorMessage(err)}`);
    });
  };

  _importSelectedModule = name => {
    const { modulesDict } = this.state;
    const { getModuleDef } = this.props;

    this._importModule(getModuleDef(modulesDict, name)).finally(() => {
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

  updateToLatestVersion = () => {
    const { getModuleOutput, slotContextVars } = this.props;
    const { latestVersionModuleDef } = this.state;
    const { version: latestVersion } = latestVersionModuleDef;

    getModuleOutput(latestVersionModuleDef).then(
      ({ slotContextVars: latestSlotContextVars }) => {
        confirmAlert({
          customUI: ({ onClose }) => (
            <div
              className="react-confirm-alert-body"
              style={{ width: '1000px' }}
            >
              <h1>Update module to version {latestVersion}?</h1>
              <p>Observe the changes in module output between versions</p>
              <p>You might need to take action to adapt your flow to them:</p>
              <FlowDiff
                str1={slotContextVars.join('\n')}
                str2={latestSlotContextVars.join('\n')}
              />
              <p>Are you sure?</p>
              <div className="react-confirm-alert-button-group">
                <button
                  onClick={() => {
                    this._importModule(latestVersionModuleDef);
                    onClose();
                  }}
                >
                  Yes, Update!
                </button>
                <button onClick={onClose}>No</button>
              </div>
            </div>
          ),
        });
      }
    );
  };

  render() {
    const {
      latestVersionModuleDef,
      moduleItems,
      s3Loading,
      showModuleSelect,
    } = this.state;
    const { name, version } = this.props;
    const { version: latestVersion } = latestVersionModuleDef || {};

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
                  onChange={item => this._importSelectedModule(item.value)}
                  options={moduleItems}
                  isSearchable={true}
                />
              </LoadingWrapper>
            </label>
          )}
        </label>
        <label>
          <h3>Version: {version ? version : ''}</h3>
          {version < latestVersion && (
            <input
              name="updateModuleVersion"
              type="button"
              value={`Update to ${latestVersion}`}
              onClick={this.updateToLatestVersion}
            />
          )}
        </label>
      </div>
    );
  }
}

export default withAlert()(ModuleImportComponent);

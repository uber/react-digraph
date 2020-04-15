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
      folderItems: [],
      loadingFolders: false,
      loadingModuleList: false,
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
    const { folder, name, getLatestVersionModuleDef } = this.props;

    return getLatestVersionModuleDef(folder, name)
      .then(latestVersionModuleDef => this.setState({ latestVersionModuleDef }))
      .catch(err =>
        this.alert.error(
          `Couldn't fetch module versions: ${getErrorMessage(err)}`
        )
      );
  };

  _reloadFolders = () => {
    this.setState({
      loadingFolders: true,
    });

    return this.props
      .getModuleFolders()
      .then(folders => {
        this.setState({
          folderItems: folders.map(m => getSimpleItem(m)),
          loadingFolders: false,
        });
      })
      .catch(err => {
        this.setState({
          loadingFolders: false,
          folderItems: [],
        });
        this.alert.error(
          `Couldn't retrieve module folders: ${getErrorMessage(err)}`
        );
      });
  };

  _reloadModules = folder => {
    this.setState({
      loadingModuleList: true,
    });

    return this.props
      .getModuleDefs(folder)
      .then(modules => {
        this.setState({
          modulesDict: modules,
          moduleItems: Object.keys(modules).map(m => getSimpleItem(m)),
          loadingModuleList: false,
        });
      })
      .catch(err => {
        this.setState({
          loadingModuleList: false,
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

  _selectFolder = folder => {
    this._reloadModules(folder);
    this.setState({ newFolder: folder });
  };

  onShowModuleSelectClick = () => {
    this.setState(prevState => ({
      showModuleSelect: !prevState.showModuleSelect,
    }));
    this._reloadFolders();
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
      folderItems,
      latestVersionModuleDef,
      moduleItems,
      newFolder,
      loadingFolders,
      loadingModuleList,
      showModuleSelect,
    } = this.state;
    const { folder, name, version } = this.props;
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
          <div>
            {showModuleSelect && (
              <label style={{ display: 'flex', border: 'none' }}>
                <LoadingWrapper
                  isLoading={loadingFolders}
                  width="100px"
                  height="40px"
                >
                  <Select
                    className="selectShortContainer"
                    theme={selectTheme}
                    value={getSimpleItem(newFolder || '')}
                    onChange={item => this._selectFolder(item.value)}
                    options={folderItems}
                    isSearchable={true}
                  />
                </LoadingWrapper>
              </label>
            )}
            {showModuleSelect && newFolder && (
              <label style={{ display: 'flex', border: 'none' }}>
                <LoadingWrapper
                  isLoading={loadingModuleList}
                  width="300px"
                  height="40px"
                >
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
          </div>
        </label>
        <label>
          <h3>Folder: {folder ? folder : ''}</h3>
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

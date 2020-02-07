import * as React from 'react';
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { withAlert } from 'react-alert';
import debounce from 'debounce';

import GraphUtils from '../../../utilities/graph-util';
import { getSimpleItem, LoadingWrapper, Input } from './common';
import { STG, PROD, ENVS } from '../handlers/flow-management-handlers';
import FlowDiff from './flow-diff';

class FlowManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showOpenSelectors: false,
      legacy: false,
      s3stored: false,
      env: STG,
      prodFlow: false,
      saving: false,
    };
    this.alert = this.props.alert;
    this.autosave = debounce(
      () => this.saveFlow(this.props.flowManagementHandlers.saveFlow),
      3000
    );
  }

  componentDidUpdate(prevProps) {
    const { flowName } = this.props;

    if (prevProps.flowName != flowName) {
      const legacy = flowName && flowName.endsWith('.py.json');

      this.setState({ showOpenSelectors: false, legacy });
    } else if (prevProps.jsonText !== this.props.jsonText) {
      this.autosave();
    }
  }

  unsavedChanges = () => this.props.initialJsonText !== this.props.jsonText;

  unshippedChanges = () => this.props.jsonText !== this.props.prodJsonText;

  safeExecute = (
    f,
    mustConfirm,
    title = 'You have unsaved changes',
    message = 'If you click "Yes", your unsaved changes will be lost. Do you still want to continue?',
    customUI = null
  ) => {
    if (mustConfirm) {
      confirmAlert({
        title: title,
        message: message,
        buttons: [
          {
            label: 'Yes',
            onClick: () => f(),
          },
          {
            label: 'No',
            onClick: () => null,
          },
        ],
        customUI,
      });
    } else {
      f();
    }
  };

  _openFlow = (flowName, openFlow) =>
    openFlow(this.state.env, flowName)
      .then(() =>
        this.setState({ s3stored: true, prodFlow: this.state.env === PROD })
      )
      .catch(err =>
        this.alert.error(`Couldn't open flow: ${JSON.stringify(err, null, 4)}`)
      );

  safeOpen = (flowName, openFlow) =>
    this.safeExecute(
      () => this._openFlow(flowName, openFlow),
      this.unsavedChanges()
    );

  safeNew = newFlow => {
    this.safeExecute(() => {
      newFlow();
      this.setState({ s3stored: false, prodFlow: false });
    }, this.unsavedChanges());
  };

  safeDelete = deleteFlow =>
    this.deleteEnabled() &&
    this.safeExecute(
      () => {
        deleteFlow();
        this.setState({ s3stored: false, prodFlow: false });
      },
      true,
      'Delete the flow?',
      'This flow will be deleted remotely from s3 and will be no longer available'
    );

  safeClone = cloneFlow =>
    this.cloneEnabled() &&
    this.safeExecute(() => {
      cloneFlow();
      this.setState({ s3stored: true, prodFlow: false });
    }, this.unsavedChanges());

  _shipFlow = shipFlow =>
    shipFlow()
      .then(() => this.alert.success('Flow successfully shipped!'))
      .catch(err =>
        this.alert.error(
          `Flow shipping failed: ${JSON.stringify(err, null, 4)}`
        )
      );

  safeShip = () => {
    const {
      shipFlow,
      getJsonText,
      getProdJsonText,
    } = this.props.flowManagementHandlers;

    if (!this.shipEnabled()) {
      return;
    }

    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="react-confirm-alert-body" style={{ width: '1000px' }}>
          <h1>Ship this flow to prod?</h1>
          <p>If a flow with the same name exists, it will be overriden</p>
          <p>Review your changes first:</p>
          <FlowDiff str1={getProdJsonText()} str2={getJsonText()} />
          <p>Are you sure?</p>
          <div className="react-confirm-alert-button-group">
            <button
              onClick={() => {
                this._shipFlow(shipFlow);
                onClose();
              }}
            >
              Yes, Ship it!
            </button>
            <button onClick={onClose}>No</button>
          </div>
        </div>
      ),
    });
  };

  saveFlow = saveFlow => {
    if (!this.saveEnabled()) {
      return;
    }

    this.setState({ saving: true });
    saveFlow()
      .then(() => this.setState({ saving: false, s3stored: true }))
      .catch(err => {
        this.setState({ saving: false });
        this.alert.error(`Flow save failed: ${JSON.stringify(err, null, 4)}`);
      });
  };

  onClickOpenIcon = () => {
    if (this.state.showOpenSelectors) {
      this.setState({ showOpenSelectors: false });
    } else {
      this.setState({ showOpenSelectors: true });
      this._reloadFlows(this.state.env);
    }
  };

  changeEnv = env => {
    this.setState({ env });
    this._reloadFlows(env);
  };

  _reloadFlows = env => {
    this.setState({
      s3Loading: true,
    });
    this.props.flowManagementHandlers.getFlows(env).then(flows => {
      this.setState({
        flows: flows.map(f => getSimpleItem(f.Key)),
        s3Loading: false,
      });
    });
  };

  getDisplayName = () => {
    const { flowName } = this.props;
    const { legacy, prodFlow } = this.state;

    return `${flowName ? flowName : 'unnamed'}${
      legacy ? '(legacy,readonly)' : ''
    }${prodFlow ? '(prod,readonly)' : ''}${this.unsavedChanges() ? '*' : ''}`;
  };

  handleKeyDown = e => {
    this.executeOnEnter(e, this.rename);
    this.executeOnEsc(e, this.cancelRename);
  };

  executeOnEnter = (e, f) => {
    if (e.key === 'Enter') {
      f();
    }
  };

  executeOnEsc = (e, f) => {
    if (e.keyCode === 27) {
      f();
    }
  };

  cancelRename = () => {
    this.setState({ renaming: false });
  };

  _rename = flowName =>
    this.props.flowManagementHandlers
      .renameFlow(flowName)
      .catch(err =>
        this.alert.error(
          `Flow renaming failed: ${JSON.stringify(err, null, 4)}`
        )
      )
      .then(this.setState({ s3stored: true }));

  rename = () => {
    this.setState({ renaming: false });
    const flowName = `${this.state.newFlowName}.json`;

    this._rename(flowName);
  };

  startRename = () => {
    const { flowName, s3Available } = this.props;

    if (!this.state.legacy && s3Available) {
      this.setState({
        renaming: true,
        newFlowName: (flowName && flowName.slice(0, -5)) || '',
      });
    }
  };

  saveEnabled = () => {
    const { legacy, prodFlow, saving } = this.state;
    const { flowName } = this.props;

    return this.unsavedChanges() && flowName && !legacy && !prodFlow && !saving;
  };

  saveClasses = () =>
    GraphUtils.classNames(
      ['managerButton']
        .concat(this.saveEnabled() ? ['enabled'] : [])
        .concat(this.state.saving ? ['executing'] : [])
    );

  deleteEnabled = () => {
    const { s3stored, legacy, prodFlow } = this.state;

    return s3stored && !legacy && !prodFlow;
  };

  deleteClasses = () => {
    const classes = ['managerButton svg-inline--fa fa-trash fa-w-14'];

    return GraphUtils.classNames(
      classes.concat(this.deleteEnabled() ? ['enabled'] : [])
    );
  };

  cloneEnabled = () => this.state.s3stored;

  cloneClasses = () => {
    const classes = ['managerButton svg-inline--fa fa-copy fa-w-14'];

    return GraphUtils.classNames(
      classes.concat(this.cloneEnabled() ? ['enabled'] : [])
    );
  };

  shipEnabled = () => {
    const { s3stored, legacy, prodFlow } = this.state;

    return (
      s3stored &&
      !legacy &&
      !this.unsavedChanges() &&
      !prodFlow &&
      this.unshippedChanges()
    );
  };

  shipClasses = () => {
    const classes = ['managerButton svg-inline--fa fa-rocket fa-w-16'];

    return GraphUtils.classNames(
      classes.concat(this.shipEnabled() ? ['enabled'] : [])
    );
  };

  render() {
    const {
      s3Loading,
      showOpenSelectors,
      flows,
      legacy,
      renaming,
      newFlowName,
      env,
      saving,
    } = this.state;
    const { flowManagementHandlers, s3Available } = this.props;
    const {
      openFlow,
      saveFlow,
      newFlow,
      deleteFlow,
      cloneFlow,
    } = flowManagementHandlers;

    return (
      <div style={{ display: 'flex' }}>
        {s3Available && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg
              className="managerButton enabled"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => this.safeNew(newFlow)}
            >
              <path d="m262.96875 8.785156v119.746094h119.746094zm0 0" />
              <path d="m211 376.5c0-91.257812 74.242188-165.5 165.5-165.5 5.058594 0 10.058594.242188 15 .6875v-53.152344h-143.53125c-8.285156 0-15-6.71875-15-15v-143.535156h-217.96875c-8.285156 0-15 6.714844-15 15v482c0 8.285156 6.714844 15 15 15h266.585938c-42.652344-29.96875-70.585938-79.527344-70.585938-135.5zm0 0" />
              <path d="m416.667969 361.5h-25.167969v-25.167969c0-8.28125-6.714844-15-15-15s-15 6.71875-15 15v25.167969h-25.164062c-8.285157 0-15 6.714844-15 15s6.714843 15 15 15h25.164062v25.167969c0 8.28125 6.714844 15 15 15s15-6.71875 15-15v-25.167969h25.167969c8.285156 0 15-6.714844 15-15s-6.714844-15-15-15zm0 0" />
              <path d="m376.5 241c-74.714844 0-135.5 60.785156-135.5 135.5s60.785156 135.5 135.5 135.5 135.5-60.785156 135.5-135.5-60.785156-135.5-135.5-135.5zm0 241c-58.171875 0-105.5-47.328125-105.5-105.5s47.328125-105.5 105.5-105.5 105.5 47.328125 105.5 105.5-47.328125 105.5-105.5 105.5zm0 0" />
            </svg>
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="copy"
              className={this.cloneClasses()}
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              onClick={() => this.safeClone(cloneFlow)}
            >
              <path d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z"></path>
            </svg>
            <svg
              className="managerButton enabled"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 225.693 225.693"
              style={{
                enableBackground: 'new 0 0 225.693 225.693',
              }}
              onClick={this.onClickOpenIcon}
            >
              <path
                d="M8.427,78.346h208.839c2.391,0,4.596,0.971,6.211,2.732s2.391,4.044,2.183,6.425l-10.222,117.15
                c-0.383,4.385-3.99,7.692-8.393,7.692H21.4c-4.301,0-7.9-3.224-8.374-7.497L0.053,87.698c-0.267-2.413,0.478-4.737,2.097-6.546
                C3.77,79.342,5.999,78.346,8.427,78.346z M214.513,63.346V44.811c0-4.143-2.524-7.465-6.667-7.465h-83.333v-2.341
                c0-12.219-8.176-21.659-19.25-21.659H30.43c-11.074,0-20.917,9.44-20.917,21.659v24.951c0,1.231,0.68,2.379,1.267,3.39H214.513z"
              />
            </svg>
            {showOpenSelectors && (
              <div style={{ display: 'flex' }}>
                <label style={{ display: 'flex', border: 'none' }}>
                  <Select
                    className="selectShortContainer"
                    value={getSimpleItem(env)}
                    onChange={item => this.changeEnv(item.value)}
                    options={ENVS.map(env => getSimpleItem(env))}
                    isSearchable={false}
                  />
                </label>
                <label style={{ display: 'flex', border: 'none' }}>
                  <LoadingWrapper
                    isLoading={s3Loading}
                    width="200px"
                    height="40px"
                  >
                    <Select
                      className="selectContainer"
                      value=""
                      onChange={item => this.safeOpen(item.value, openFlow)}
                      options={flows}
                      isSearchable={true}
                    />
                  </LoadingWrapper>
                </label>
              </div>
            )}
            <svg
              id="saveFlowBtn"
              className={this.saveClasses()}
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 1000 1000"
              style={{
                enableBackground: 'new 0 0 1000 1000',
              }}
              onClick={() => this.saveFlow(saveFlow)}
            >
              <g>
                <path d="M888.6,990c-259,0-518.1,0-777.1,0c-1.8-0.6-3.5-1.5-5.3-1.8c-45-8.1-74.9-33.8-90.2-76.7c-2.6-7.4-4-15.3-5.9-22.9c0-259,0-518.1,0-777.1c0.6-1.8,1.5-3.5,1.8-5.4c9.2-49.4,38.6-80,86.8-93c4.3-1.2,8.6-2.1,12.8-3.1c222.7,0,445.3,0,668,0c27.8,6.1,49.6,22.7,69.5,41.7c32.9,31.5,65.2,63.7,96.8,96.6c19.9,20.6,37.8,43.1,44.3,72.3c0,222.7,0,445.3,0,668c-0.6,1.8-1.5,3.5-1.8,5.3c-9.2,49.4-38.5,80-86.8,93C897.2,988,892.8,989,888.6,990z M500.1,952.5c111.3,0,222.6,0,333.9,0c28.3,0,43.2-14.9,43.2-42.9c0-122.2,0-244.3,0-366.5c0-28.1-15-43.3-42.9-43.3c-223,0-445.9,0-668.8,0c-27.4,0-42.8,15.2-42.8,42.5c0,122.5,0,244.9,0,367.4c0,4.4,0.1,9,1.1,13.3c4.6,19.4,19.1,29.5,42.2,29.5C277.5,952.5,388.8,952.5,500.1,952.5z M480.9,387.3c79.4,0,158.8,0,238.2,0c30.5,0,45.2-14.6,45.2-45c0-83.2,0-166.4,0-249.7c0-30.6-14.4-45-45.1-45c-158.8,0-317.6,0-476.4,0C212.7,47.5,198,62.1,198,92c-0.1,83.5-0.1,167.1,0,250.6c0,29.9,14.9,44.7,44.7,44.7C322.1,387.3,401.5,387.3,480.9,387.3z" />
                {saving && (
                  <animate
                    attributeName="fill"
                    values="gray;violetblue;aqua;gray"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                )}
                <path d="M576.4,86.1c37.3,0,73.6,0,110.7,0c0,87.5,0,174.5,0,262.1c-36.8,0-73.4,0-110.7,0C576.4,261.1,576.4,174,576.4,86.1z" />
              </g>
            </svg>
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="trash"
              className={this.deleteClasses()}
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              onClick={() => this.safeDelete(deleteFlow)}
            >
              <path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path>
            </svg>
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="rocket"
              className={this.shipClasses()}
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              onClick={this.safeShip}
            >
              <path d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z">
                {this.shipEnabled() && (
                  <animate
                    attributeName="fill"
                    values="black;aqua;green;black"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            </svg>
          </div>
        )}
        {!renaming ? (
          <h2
            style={{
              flex: 1,
              color: legacy ? 'crimson' : 'black',
              marginLeft: '50px',
              marginRight: '50px',
            }}
            onClick={this.startRename}
          >
            {this.getDisplayName()}
          </h2>
        ) : (
          <div style={{ display: 'flex' }}>
            <Input
              name="flowName"
              value={newFlowName}
              onKeyDown={this.handleKeyDown}
              onBlur={this.cancelRename}
              onChange={value => this.setState({ newFlowName: value })}
              style={{
                height: 30,
                alignSelf: 'center',
                fontSize: '1.5em',
                marginBlockStart: '0.83em',
                marginBlockEnd: '0.83em',
                marginInlineStart: '0px',
                marginInlineEnd: '0px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
              }}
              autoFocus
            />
            <h2 style={{ flex: 1 }}>{`.json${
              this.unsavedChanges() ? '*' : ''
            }`}</h2>
          </div>
        )}
      </div>
    );
  }
}

export default withAlert()(FlowManagement);

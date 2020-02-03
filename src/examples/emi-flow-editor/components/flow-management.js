import * as React from 'react';
import Select from 'react-select';
import GraphUtils from '../../../utilities/graph-util';
import { getSimpleItem, LoadingWrapper } from './common';

class FlowManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true, showSelector: false, legacy: false };
  }

  componentDidUpdate(prevProps) {
    const { flowManagementHandlers, s3Available, flowName } = this.props;

    if (prevProps.s3Available !== s3Available && s3Available) {
      this.setState({
        isLoading: true,
      });
      flowManagementHandlers.getFlows().then(flows => {
        this.setState({
          flows: flows.map(f => getSimpleItem(f.Key)),
          isLoading: false,
        });
      });
    }

    if (prevProps.flowName != flowName) {
      const legacy = flowName.endsWith('.py');

      this.setState({ showSelector: false, legacy });
    }
  }

  onClickOpenIcon = () =>
    this.setState(prevState => ({ showSelector: !prevState.showSelector }));

  saveClasses = () => {
    const enabled = this.props.unsavedChanges && !this.state.legacy;

    return GraphUtils.classNames(
      ['managerButton'].concat(enabled ? ['enabled'] : [])
    );
  };

  getDisplayName = () => {
    const { flowName, unsavedChanges } = this.props;
    const { legacy } = this.state;

    return `${flowName ? flowName : 'unnamed'}${
      legacy ? '(legacy,readonly)' : unsavedChanges ? '*' : ''
    }`;
  };

  render() {
    const { isLoading, showSelector, flows, legacy } = this.state;
    const { flowManagementHandlers, s3Available } = this.props;
    const { openFlow, saveFlow } = flowManagementHandlers;

    return (
      <div style={{ display: 'flex' }}>
        {s3Available && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
            {showSelector && (
              <label style={{ display: 'flex', border: 'none' }}>
                <LoadingWrapper isLoading={isLoading}>
                  <Select
                    className="selectContainer"
                    value=""
                    onChange={item => openFlow(item.value)}
                    options={flows}
                    isSearchable={true}
                  />
                </LoadingWrapper>
              </label>
            )}
          </div>
        )}
        <h2 style={{ flex: 1, color: legacy ? 'crimson' : 'black' }}>
          {this.getDisplayName()}
        </h2>
        {s3Available && (
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
            onClick={saveFlow}
          >
            <g>
              <path d="M888.6,990c-259,0-518.1,0-777.1,0c-1.8-0.6-3.5-1.5-5.3-1.8c-45-8.1-74.9-33.8-90.2-76.7c-2.6-7.4-4-15.3-5.9-22.9c0-259,0-518.1,0-777.1c0.6-1.8,1.5-3.5,1.8-5.4c9.2-49.4,38.6-80,86.8-93c4.3-1.2,8.6-2.1,12.8-3.1c222.7,0,445.3,0,668,0c27.8,6.1,49.6,22.7,69.5,41.7c32.9,31.5,65.2,63.7,96.8,96.6c19.9,20.6,37.8,43.1,44.3,72.3c0,222.7,0,445.3,0,668c-0.6,1.8-1.5,3.5-1.8,5.3c-9.2,49.4-38.5,80-86.8,93C897.2,988,892.8,989,888.6,990z M500.1,952.5c111.3,0,222.6,0,333.9,0c28.3,0,43.2-14.9,43.2-42.9c0-122.2,0-244.3,0-366.5c0-28.1-15-43.3-42.9-43.3c-223,0-445.9,0-668.8,0c-27.4,0-42.8,15.2-42.8,42.5c0,122.5,0,244.9,0,367.4c0,4.4,0.1,9,1.1,13.3c4.6,19.4,19.1,29.5,42.2,29.5C277.5,952.5,388.8,952.5,500.1,952.5z M480.9,387.3c79.4,0,158.8,0,238.2,0c30.5,0,45.2-14.6,45.2-45c0-83.2,0-166.4,0-249.7c0-30.6-14.4-45-45.1-45c-158.8,0-317.6,0-476.4,0C212.7,47.5,198,62.1,198,92c-0.1,83.5-0.1,167.1,0,250.6c0,29.9,14.9,44.7,44.7,44.7C322.1,387.3,401.5,387.3,480.9,387.3z" />
              <path d="M576.4,86.1c37.3,0,73.6,0,110.7,0c0,87.5,0,174.5,0,262.1c-36.8,0-73.4,0-110.7,0C576.4,261.1,576.4,174,576.4,86.1z" />
            </g>
          </svg>
        )}
      </div>
    );
  }
}

export default FlowManagement;

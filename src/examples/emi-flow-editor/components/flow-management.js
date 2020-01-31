import * as React from 'react';
import Select from 'react-select';
import { getSimpleItem, LoadingWrapper } from './common';

class FlowManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true, showSelector: false };
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
      this.setState({ showSelector: false });
    }
  }

  getDisplayName = () => {
    const { flowName, unsavedChanges } = this.props;

    return `${flowName ? flowName : 'unnamed'}${
      unsavedChanges ? ' (unsaved)' : ''
    }`;
  };

  onClickOpenIcon = () =>
    this.setState(prevState => ({ showSelector: !prevState.showSelector }));

  render() {
    const { isLoading, showSelector, flows } = this.state;
    const { flowManagementHandlers, s3Available } = this.props;
    const { openFlow } = flowManagementHandlers;

    return (
      <div style={{ display: 'flex' }}>
        <h1 style={{ flex: 1, margin: '20px' }}>{this.getDisplayName()}</h1>
        {s3Available && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 225.693 225.693"
              style={{
                width: 20,
                flex: 1,
                margin: 10,
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
      </div>
    );
  }
}

export default FlowManagement;

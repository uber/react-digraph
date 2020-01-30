import * as React from 'react';
import Select from 'react-select';
import { getSimpleItem, LoadingWrapper } from './common';

class FlowManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true };
  }

  componentDidMount() {
    this.props.flowManagementHandlers.getFlows().then(flows => {
      this.setState({
        flows: flows.map(f => getSimpleItem(f.Key)),
        isLoading: false,
      });
    });
  }

  render() {
    const { flowManagementHandlers, flowName } = this.props;
    const { openFlow } = flowManagementHandlers;

    return (
      <div style={{ display: 'flex' }}>
        <h1 style={{ flex: 1, margin: '20px' }}>
          {flowName ? flowName : 'unnamed'}
        </h1>
        <label>
          Open:
          <LoadingWrapper isLoading={this.state.isLoading}>
            <Select
              className="selectContainer"
              value=""
              onChange={item => openFlow(item.value)}
              options={this.state.flows}
              isSearchable={true}
            />
          </LoadingWrapper>
        </label>
      </div>
    );
  }
}

export default FlowManagement;

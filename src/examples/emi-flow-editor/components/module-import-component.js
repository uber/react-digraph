import * as React from 'react';
import Select from 'react-select';
import { withAlert } from 'react-alert';

import { selectTheme, getSimpleItem, LoadingWrapper } from './common';

class ModuleImportComponent extends React.Component {
  constructor(props) {
    super(props);

    this.alert = this.props.alert;
    this.state = {
      s3Loading: false,
      modules: [],
    };
  }

  componentDidMount() {
    this._reloadFlows();
  }

  _reloadFlows = () => {
    this.setState({
      s3Loading: true,
    });
    this.props
      .getModules()
      .then(modules => {
        this.setState({
          modules: modules.map(f => getSimpleItem(f.Key)),
          s3Loading: false,
        });
      })
      .catch(err => {
        this.setState({
          s3Loading: false,
          modules: [],
        });
        this.alert.error(
          `Couldn't retrieve modules: ${JSON.stringify(err, null, 4)}`
        );
      });
  };

  render() {
    const { s3Loading, modules } = this.state;
    // const { modulePath } = this.props;

    return (
      <div id="moduleImportEditor" className="rightEditor">
        <label style={{ display: 'flex', border: 'none' }}>
          Module:
          <LoadingWrapper isLoading={s3Loading} width="300px" height="40px">
            <Select
              className="selectLongContainer"
              theme={selectTheme}
              value=""
              onChange={item => null}
              options={modules}
              isSearchable={true}
            />
          </LoadingWrapper>
        </label>
      </div>
    );
  }
}

export default withAlert()(ModuleImportComponent);

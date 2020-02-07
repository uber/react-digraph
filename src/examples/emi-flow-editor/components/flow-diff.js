import React, { PureComponent } from 'react';
import ReactDiffViewer from 'react-diff-viewer';

class FlowDiff extends PureComponent {
  render = () => {
    const { str1, str2 } = this.props;

    return (
      <div className="shipConfirm">
        <ReactDiffViewer
          oldValue={str1}
          newValue={str2}
          splitView={true}
          showDiffOnly
          useDarkTheme
        />
      </div>
    );
  };
}

export default FlowDiff;

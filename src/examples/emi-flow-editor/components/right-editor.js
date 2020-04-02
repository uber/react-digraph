import * as React from 'react';

import MultiEdgeEditor from './multi-edge-editor';
import FaqEditor from './faq-editor';
import NodeEditor from './node-editor';

class RightEditor extends React.Component {
  render() {
    const {
      children,
      faqMode,
      nodeHandlers,
      edgeHandlers,
      faqHandlers,
    } = this.props;

    if (!children && !faqMode) {
      return (
        <div id="rightEditor" className="rightEditor">
          <h1>Select a node or an edge, or click on FAQ...</h1>
        </div>
      );
    } else if (faqMode) {
      return <FaqEditor faqHandlers={faqHandlers} />;
    } else if (children.source) {
      return (
        <MultiEdgeEditor edgeHandlers={edgeHandlers}>
          {children}
        </MultiEdgeEditor>
      );
    } else {
      return <NodeEditor nodeHandlers={nodeHandlers}>{children}</NodeEditor>;
    }
  }
}

export default RightEditor;

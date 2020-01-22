import * as React from 'react';
import Select from 'react-select';
import { selectTheme, getSimpleItem } from './common';
import EdgeEditor from './edge-editor';

class MultiEdgeEditor extends React.Component {
  render() {
    const { children, edgeHandlers } = this.props;
    const { setSelectedConnIndex, getSelectedConnIndex } = edgeHandlers;
    const edge = children;
    const conn = edge.conns[getSelectedConnIndex()];

    return (
      <div id="multiEdgeEditor" className="someNodeEditor">
        <label>
          Edge:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getSimpleItem(getSelectedConnIndex())}
            onChange={item => {
              setSelectedConnIndex(item.value);
              this.forceUpdate();
            }}
            options={[...Array(edge.conns.length).keys()].map(c =>
              getSimpleItem(c)
            )}
            isSearchable={false}
          />
        </label>
        <EdgeEditor edgeHandlers={edgeHandlers} edge={edge}>
          {conn}
        </EdgeEditor>
      </div>
    );
  }
}

export default MultiEdgeEditor;

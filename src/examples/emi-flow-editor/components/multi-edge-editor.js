import * as React from 'react';
import Select from 'react-select';
import { Button, selectTheme, getSimpleItem } from './common';
import GraphUtils from '../../../utilities/graph-util';
import EdgeEditor from './edge-editor';

class MultiEdgeEditor extends React.Component {
  deleteEdgeConnClasses = edge =>
    GraphUtils.classNames(edge.conns.length < 2 ? ['disabled'] : ['enabled']);

  render() {
    const { children, edgeHandlers } = this.props;
    const {
      setSelectedConnIndex,
      getSelectedConnIndex,
      newEdgeConn,
      onDeleteSelectedEdgeConn,
    } = edgeHandlers;
    const edge = children;
    const conn = edge.conns[getSelectedConnIndex()];

    return (
      <div id="multiEdgeEditor" className="rightEditor">
        <h1>
          {edge.source} =&gt; {edge.target}
        </h1>
        <label>
          Connections:
          <label style={{ display: 'flex' }}>
            Selected:
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
            <svg
              id="deleteEdgeConn"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 297 297"
              className={this.deleteEdgeConnClasses(edge)}
              style={{ enableBackground: 'new 0 0 297 297' }}
              onClick={onDeleteSelectedEdgeConn}
            >
              <g>
                <g>
                  <g>
                    <path
                      d="M216.979,150.445c-24.601,0-44.615,20.014-44.615,44.615s20.014,44.615,44.615,44.615
                        c24.6,0,44.615-20.014,44.615-44.615S241.58,150.445,216.979,150.445z M238.868,207.41c2.633,2.634,2.633,6.904,0,9.539
                        c-1.317,1.316-3.044,1.975-4.769,1.975c-1.725,0-3.452-0.659-4.769-1.975l-12.35-12.35l-12.35,12.35
                        c-1.317,1.316-3.044,1.975-4.769,1.975s-3.452-0.659-4.769-1.975c-2.633-2.634-2.633-6.904,0-9.539l12.35-12.35l-12.352-12.35
                        c-2.633-2.634-2.633-6.904,0-9.539c2.634-2.632,6.904-2.632,9.539,0l12.35,12.35l12.35-12.35c2.634-2.632,6.904-2.632,9.539,0
                        c2.633,2.634,2.633,6.904,0,9.539l-12.35,12.35L238.868,207.41z"
                    />
                    <path
                      d="M227.354,59.832L227.354,59.832c-0.001-10.822-8.806-19.626-19.628-19.626H55.033c-10.822,0-19.626,8.804-19.626,19.626
                        v18.244h191.948V59.832z"
                    />
                    <path
                      d="M216.979,136.957c1.233,0,2.454,0.052,3.668,0.128l2.716-45.521h-47.368v62.351
                      C186.51,143.442,200.999,136.957,216.979,136.957z"
                    />
                    <path
                      d="M103.885,13.488h54.99v13.229h13.488V6.744c0-3.725-3.019-6.744-6.744-6.744H97.14c-3.725,0-6.744,3.019-6.744,6.744
                      v19.973h13.488V13.488z"
                    />
                    <path
                      d="M175.994,273.748c0,5.393-4.372,9.764-9.764,9.764c-5.393,0-9.764-4.371-9.764-9.764V91.564h-50.173v182.184
                      c0,5.393-4.372,9.764-9.764,9.764c-5.393,0-9.764-4.371-9.764-9.764V91.564H39.398l11.881,199.094
                      C51.492,294.22,54.442,297,58.01,297h146.739c3.569,0,6.519-2.78,6.732-6.342l2.243-37.591
                      c-14.686-0.815-27.934-7.104-37.73-16.862V273.748z"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </label>
          <label>
            Create:
            <Button
              onClick={() => {
                newEdgeConn();
                this.forceUpdate();
              }}
            >
              +
            </Button>
          </label>
        </label>
        <EdgeEditor edgeHandlers={edgeHandlers} edge={edge}>
          {conn}
        </EdgeEditor>
      </div>
    );
  }
}

export default MultiEdgeEditor;

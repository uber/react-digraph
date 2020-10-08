// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as React from 'react';
import ArrowheadMarker from './arrowhead-marker';
import BackgroundPattern from './background-pattern';
import DropshadowFilter from './dropshadow-filter';

type IDefsProps = {
  gridSpacing?: number;
  gridDotSize?: number;
  edgeArrowSize?: number;
  nodeTypes: any; // TODO: define nodeTypes, nodeSubtypes, and edgeTypes. Must have shape and shapeId!
  nodeSubtypes: any;
  edgeTypes: any;
  renderDefs?: () => any | null;
};

type IDefsState = {
  graphConfigDefs: unknown[];
};

class Defs extends React.Component<IDefsProps, IDefsState> {
  static defaultProps = {
    gridDotSize: 2,
    renderDefs: () => null,
  };

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    const graphConfigDefs: unknown = [];

    this.processGraphConfigDefs(nextProps.nodeTypes, graphConfigDefs);
    this.processGraphConfigDefs(nextProps.nodeSubtypes, graphConfigDefs);
    this.processGraphConfigDefs(nextProps.edgeTypes, graphConfigDefs);

    return {
      graphConfigDefs,
    };
  }

  static processGraphConfigDefs(typesObj: any, graphConfigDefs: any) {
    Object.keys(typesObj).forEach((type) => {
      const safeId = typesObj[type].shapeId
        ? typesObj[type].shapeId.replace('#', '')
        : 'graphdef';

      graphConfigDefs.push(
        React.cloneElement(typesObj[type].shape, {
          key: `${safeId}-${graphConfigDefs.length + 1}`,
        })
      );
    });
  }

  constructor(props: IDefsProps) {
    super(props);
    this.state = {
      graphConfigDefs: [],
    };
  }

  render() {
    const { edgeArrowSize, gridSpacing, gridDotSize } = this.props;

    return (
      <defs>
        {this.state.graphConfigDefs}

        <ArrowheadMarker edgeArrowSize={edgeArrowSize} />

        <BackgroundPattern
          gridSpacing={gridSpacing}
          gridDotSize={gridDotSize}
        />

        <DropshadowFilter />

        {this.props.renderDefs && this.props.renderDefs()}
      </defs>
    );
  }
}

export default Defs;

// @flow

import React, { useState, useEffect } from 'react';
import ArrowheadMarker from './arrowhead-marker';
import BackgroundPattern from './background-pattern';
import DropshadowFilter from './dropshadow-filter';
import {
  DEFAULT_GRID_DOT_SIZE,
  DEFAULT_EDGE_ARROW_SIZE,
  DEFAULT_GRID_SPACING,
} from '../constants';

type IDefsProps = {
  gridSpacing?: number,
  gridDotSize?: number,
  edgeArrowSize?: number,
  nodeTypes: any, // TODO: define nodeTypes, nodeSubtypes, and edgeTypes. Must have shape and shapeId!
  nodeSubtypes: any,
  edgeTypes: any,
  renderDefs?: () => any | null,
};

export function generateGraphConfigDefs(typesObj: any) {
  const newGraphConfigDefs = [];

  Object.keys(typesObj).forEach(type => {
    const safeId = typesObj[type].shapeId
      ? typesObj[type].shapeId.replace('#', '')
      : 'graphdef';

    newGraphConfigDefs.push(
      React.cloneElement(typesObj[type].shape, {
        key: `${safeId}-${newGraphConfigDefs.length + 1}`,
      })
    );
  });

  return newGraphConfigDefs;
}

function Defs({
  gridDotSize = DEFAULT_GRID_DOT_SIZE,
  edgeArrowSize = DEFAULT_EDGE_ARROW_SIZE,
  gridSpacing = DEFAULT_GRID_SPACING,
  nodeTypes,
  nodeSubtypes,
  edgeTypes,
  renderDefs = () => null,
}: IDefsProps) {
  const [graphConfigDefs, setGraphConfigDefs] = useState([]);

  useEffect(() => {
    const combinedDefs = [
      ...generateGraphConfigDefs(nodeTypes),
      ...generateGraphConfigDefs(nodeSubtypes),
      ...generateGraphConfigDefs(edgeTypes),
    ];

    setGraphConfigDefs(combinedDefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeTypes, nodeSubtypes, edgeTypes]);

  return (
    <defs>
      {graphConfigDefs}

      <ArrowheadMarker edgeArrowSize={edgeArrowSize} />

      <BackgroundPattern gridSpacing={gridSpacing} gridDotSize={gridDotSize} />

      <DropshadowFilter />

      {renderDefs()}
    </defs>
  );
}

export default Defs;

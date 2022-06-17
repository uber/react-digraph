// @flow

import * as React from 'react';
import { DEFAULT_EDGE_ARROW_SIZE } from '../constants';

type IArrowheadMarkerProps = {
  edgeArrowSize?: number,
};

function ArrowheadMarker({
  edgeArrowSize = DEFAULT_EDGE_ARROW_SIZE,
}: IArrowheadMarkerProps) {
  if (edgeArrowSize === 0) {
    return null;
  }

  return (
    <marker
      id="end-arrow"
      key="end-arrow"
      viewBox={`0 -${edgeArrowSize / 2} ${edgeArrowSize} ${edgeArrowSize}`}
      refX={`${edgeArrowSize / 2}`}
      markerWidth={`${edgeArrowSize}`}
      markerHeight={`${edgeArrowSize}`}
      orient="auto"
    >
      <path
        className="arrow"
        d={`M0,-${edgeArrowSize / 2}L${edgeArrowSize},0L0,${edgeArrowSize / 2}`}
        width={`${edgeArrowSize}`}
        height={`${edgeArrowSize}`}
      />
    </marker>
  );
}

export default ArrowheadMarker;

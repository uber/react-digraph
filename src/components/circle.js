// @flow

import * as React from 'react';
import { DEFAULT_GRID_DOT_SIZE, DEFAULT_GRID_SPACING } from '../constants';

type ICircleProps = {
  gridSpacing?: number,
  gridDotSize?: number,
};

function Circle({
  gridDotSize = DEFAULT_GRID_DOT_SIZE,
  gridSpacing = DEFAULT_GRID_SPACING,
}: ICircleProps) {
  return (
    <circle
      className="circle"
      cx={(gridSpacing || 0) / 2}
      cy={(gridSpacing || 0) / 2}
      r={gridDotSize}
    />
  );
}

export default Circle;

// @flow

import * as React from 'react';
import Circle from './circle';

type IBackgroundPatternProps = {
  gridSpacing?: number,
  gridDotSize?: number,
};

function BackgroundPattern({
  gridSpacing,
  gridDotSize,
}: IBackgroundPatternProps) {
  return (
    <pattern
      id="grid"
      key="grid"
      width={gridSpacing}
      height={gridSpacing}
      patternUnits="userSpaceOnUse"
    >
      <Circle gridSpacing={gridSpacing} gridDotSize={gridDotSize} />
    </pattern>
  );
}

export default BackgroundPattern;

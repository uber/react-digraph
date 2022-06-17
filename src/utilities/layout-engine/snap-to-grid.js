// @flow

import LayoutEngine, { type IPosition } from './layout-engine';

class SnapToGrid extends LayoutEngine {
  calculatePosition(node: IPosition) {
    const { x, y } = node;
    let { gridSpacing } = this.graphViewProps;

    gridSpacing = gridSpacing || 10;
    const gridOffset = gridSpacing / 2;

    let newX = x || 0;
    let newY = y || 0;

    if (x && (x - gridOffset) % gridSpacing !== 0) {
      // Add (gridSpacing / 2) to account for the dot rendering.
      // Now the center of the node is on a dot.
      let multiplier = 1;

      if ((x - gridOffset) % gridSpacing < gridOffset) {
        multiplier = -1;
      }

      newX =
        gridSpacing * Math.round(x / gridSpacing) + gridOffset * multiplier;
    }

    if (y && (y - gridOffset) % gridSpacing !== 0) {
      // Add (gridSpacing / 2) to account for the dot rendering.
      // Now the center of the node is on a dot.
      let multiplier = 1;

      if ((y - gridOffset) % gridSpacing < gridOffset) {
        multiplier = -1;
      }

      newY =
        gridSpacing * Math.round(y / gridSpacing) + gridOffset * multiplier;
    }

    return {
      x: newX,
      y: newY,
    };
  }
}

export default SnapToGrid;

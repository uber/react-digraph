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

import LayoutEngine, { IPosition } from './layout-engine';

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

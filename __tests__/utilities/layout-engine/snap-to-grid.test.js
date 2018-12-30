// @flow
import * as React from 'react';

import SnapToGrid from '../../../src/utilities/layout-engine/snap-to-grid';

describe('SnapToGrid', () => {
  let output = null;

  describe('class', () => {
    it('is defined', () => {
      expect(SnapToGrid).toBeDefined();
    });

    it('instantiates', () => {
      const snapToGrid = new SnapToGrid();
    });
  });

  describe('calculatePosition method', () => {
    it('adjusts the node position to be centered on a grid space', () => {
      const snapToGrid = new SnapToGrid({
        gridSpacing: 10
      });
      const newPosition = snapToGrid.calculatePosition({ x: 9, y: 8 });
      const expected = { x: 5, y: 5 };
      expect(JSON.stringify(newPosition)).toEqual(JSON.stringify(expected));
    });

    it('uses the default grid spacing', () => {
      const snapToGrid = new SnapToGrid({});
      const newPosition = snapToGrid.calculatePosition({ x: 9, y: 8 });
      const expected = { x: 5, y: 5 };
      expect(JSON.stringify(newPosition)).toEqual(JSON.stringify(expected));
    });

    it('defaults the x and y to 0 when they are not present', () => {
      const snapToGrid = new SnapToGrid({
        gridSpacing: 10
      });
      const newPosition = snapToGrid.calculatePosition({});
      const expected = { x: 0, y: 0 };
      expect(JSON.stringify(newPosition)).toEqual(JSON.stringify(expected));
    });

    it('moves the positions in the reverse direction', () => {
      const snapToGrid = new SnapToGrid({
        gridSpacing: 10
      });
      const newPosition = snapToGrid.calculatePosition({ x: 11, y: 11 });
      const expected = { x: 15, y: 15 };
      expect(JSON.stringify(newPosition)).toEqual(JSON.stringify(expected));
    });
  });
});

// @flow

import * as React from 'react';
import LayoutEngine from '../../../src/utilities/layout-engine/layout-engine';

describe('LayoutEngine', () => {
  let output = null;

  describe('class', () => {
    it('is defined', () => {
      expect(LayoutEngine).toBeDefined();
    });
  });

  describe('calculatePosition method', () => {
    it('returns the node with no changes', () => {
      const layoutEngine = new LayoutEngine();
      const position = { x: 1, y: 2 }
      const newPosition = layoutEngine.calculatePosition(position);
      expect(newPosition).toEqual(position);
    });
  });

  describe('getPositionForNode method', () => {
    it('does not modify the node', () => {
      const layoutEngine = new LayoutEngine();
      const node = { x: 1, y: 2 }
      const newPosition = layoutEngine.getPositionForNode(node);
      expect(newPosition).toEqual(node);
    });
  });
});

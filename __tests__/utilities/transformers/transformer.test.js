
// @flow

import * as React from 'react';
import Transformer from '../../../src/utilities/transformers/transformer';

describe('Transformer', () => {
  let output = null;

  describe('class', () => {
    it('is defined', () => {
      expect(Transformer).toBeDefined();
    });
  });

  describe('transform method', () => {
    it('returns a default response', () => {
      const expected = {
        edges: [],
        nodes: []
      };
      const result = Transformer.transform();
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });
  });

  describe('revert method', () => {
    it('mocks out the revert method', () => {
      const expected = {
        edges: [],
        nodes: []
      };
      const result = Transformer.revert(expected);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });
  });
});

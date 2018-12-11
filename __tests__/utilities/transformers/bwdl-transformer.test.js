
// @flow

import * as React from 'react';
import BwdlTransformer from '../../../src/utilities/transformers/bwdl-transformer';

describe('BwdlTransformer', () => {
  let output = null;

  describe('class', () => {
    it('is defined', () => {
      expect(BwdlTransformer).toBeDefined();
    });
  });

  describe('transform static method', () => {
    it('returns a default response when the input has no states', () => {
      const input = {};
      const expected = {
        edges: [],
        nodes: []
      };
      const result = BwdlTransformer.transform(input);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });

    it('returns a default node edge array for a single State node', () => {
      const input = {
        StartAt: 'test',
        States: {
          test: {}
        }
      };
      const expected = {
        edges: [],
        nodes: [{
          title: 'test',
          x: 0,
          y: 0
        }]
      };
      const result = BwdlTransformer.transform(input);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });

    it('handles Choice nodes', () => {
      const input = {
        StartAt: 'test',
        States: {
          test: {
            Type: 'Choice',
            Choices: [{
              Next: 'test2'
            }]
          },
          test2: {}
        }
      };
      const expected = {
        edges: [{
          source: 'test',
          target: 'test2'
        }],
        nodes: [
          {
            title: 'test',
            type: 'Choice',
            x: 0,
            y: 0
          },
          {
            title: 'test2',
            x: 0,
            y: 0
          }
        ]
      };
      const result = BwdlTransformer.transform(input);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });

    it('handles a Choice node with a Default value', () => {
      const input = {
        StartAt: 'test',
        States: {
          test: {
            Type: 'Choice',
            Choices: [],
            Default: 'test2'
          },
          test2: {}
        }
      };
      const expected = {
        edges: [{
          source: 'test',
          target: 'test2'
        }],
        nodes: [
          {
            title: 'test',
            type: 'Choice',
            x: 0,
            y: 0
          },
          {
            title: 'test2',
            x: 0,
            y: 0
          }
        ]
      };
      const result = BwdlTransformer.transform(input);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });

    it('handles a regular node with a Next property', () => {
      const input = {
        StartAt: 'test',
        States: {
          test: {
            Type: 'Default',
            Next: 'test2'
          },
          test2: {}
        }
      };
      const expected = {
        edges: [{
          source: 'test',
          target: 'test2'
        }],
        nodes: [
          {
            title: 'test',
            type: 'Default',
            x: 0,
            y: 0
          },
          {
            title: 'test2',
            x: 0,
            y: 0
          }
        ]
      };
      const result = BwdlTransformer.transform(input);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });

    it('returns a default set when does not have a current node', () => {
      const input = {
        StartAt: 'test',
        States: {}
      };
      const expected = {
        edges: [],
        nodes: []
      };
      const result = BwdlTransformer.transform(input);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
    });
  });

  describe('revert static method', () => {
    it('returns the input', () => {
      const input = {
        test: true
      };
      const result = BwdlTransformer.revert(input);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(input));
    });
  });
});

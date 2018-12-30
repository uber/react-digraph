// @flow
import * as React from 'react';

import VerticalTree from '../../../src/utilities/layout-engine/vertical-tree';

describe('VerticalTree', () => {
  let output = null;

  describe('class', () => {
    it('is defined', () => {
      expect(VerticalTree).toBeDefined();
    });

    it('instantiates', () => {
      const verticalTree = new VerticalTree();
    });
  });

  describe('calculatePosition method', () => {
    it('adjusts the node position to be centered on a grid space', () => {
      const verticalTree = new VerticalTree({
        nodeKey: 'id',
        nodeSize: 10
      });
      const nodes = [
        { id: 'test', x: 9, y: 8 },
        { id: 'test1', x: 4, y: 7 }
      ];
      const nodesMap = {
        'key-test': {
          incomingEdges: [],
          outgoingEdges: [{
            source: 'test',
            target: 'test1'
          }],
          node: nodes[0]
        },
        'key-test1': {
          incomingEdges: [{
            source: 'test',
            target: 'test1'
          }],
          outgoingEdges: [],
          node: nodes[0]
        }
      };
      const newNodes = verticalTree.adjustNodes(nodes, nodesMap);
      const expected = [
        { id: 'test', x: 7.5, y: 72.5 },
        { id: 'test1', x: 4, y: 7 }
      ];
      expect(JSON.stringify(newNodes)).toEqual(JSON.stringify(expected));
    });

    it('does nothing when there is no nodeMap', () => {
      const verticalTree = new VerticalTree({
        nodeKey: 'id',
        nodeSize: 10
      });
      const nodes = [
        { id: 'test', x: 9, y: 8 }
      ];
      const newNodes = verticalTree.adjustNodes(nodes);
      const expected = [
        { id: 'test', x: 9, y: 8 }
      ];
      expect(JSON.stringify(newNodes)).toEqual(JSON.stringify(expected));
    });

    it('does nothing on disconnected nodes', () => {
      const verticalTree = new VerticalTree({
        nodeKey: 'id',
        nodeSize: 10
      });
      const nodes = [
        { id: 'test', x: 9, y: 8 }
      ];
      const nodesMap = {
        'key-test': {
          incomingEdges: [],
          outgoingEdges: [],
          node: nodes[0]
        }
      };
      const newNodes = verticalTree.adjustNodes(nodes, nodesMap);
      const expected = [
        { id: 'test', x: 9, y: 8 }
      ];
      expect(JSON.stringify(newNodes)).toEqual(JSON.stringify(expected));
    });

    it('uses a default nodeSize', () => {
      const verticalTree = new VerticalTree({
        nodeKey: 'id'
      });
      const nodes = [
        { id: 'test', x: 9, y: 8 },
        { id: 'test1', x: 4, y: 7 }
      ];
      const nodesMap = {
        'key-test': {
          incomingEdges: [],
          outgoingEdges: [{
            source: 'test',
            target: 'test1'
          }],
          node: nodes[0]
        },
        'key-test1': {
          incomingEdges: [{
            source: 'test',
            target: 'test1'
          }],
          outgoingEdges: [],
          node: nodes[0]
        }
      };

      const newNodes = verticalTree.adjustNodes(nodes, nodesMap);
      const expected = [
        { id: 'test', x: 0.75, y: 52.25 },
        { id: 'test1', x: 4, y: 7 }
      ];
      expect(JSON.stringify(newNodes)).toEqual(JSON.stringify(expected));
    });
  });
});
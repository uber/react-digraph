// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import GraphView from '../../src/components/graph-view';

import GraphUtils from '../../src/utilities/graph-util';
import { start } from 'live-server';

describe('GraphUtils class', () => {
  describe('getNodesMap method', () => {
    it('converts an array of nodes to a hash map', () => {
      const nodes = [
        {
          id: 'foo',
          name: 'bar',
        },
      ];
      const nodesMap = GraphUtils.getNodesMap(nodes, 'id');

      expect(JSON.stringify(nodesMap)).toEqual(
        JSON.stringify({
          'key-foo': {
            children: [],
            incomingEdges: [],
            node: nodes[0],
            originalArrIndex: 0,
            outgoingEdges: [],
            parents: [],
          },
        })
      );
    });
  });

  describe('getEdgesMap method', () => {
    it('converts an array of edges to a hash map', () => {
      const edges = [
        {
          source: 'foo',
          target: 'bar',
        },
      ];
      const edgesMap = GraphUtils.getEdgesMap(edges);

      expect(JSON.stringify(edgesMap)).toEqual(
        JSON.stringify({
          foo_bar: {
            edge: edges[0],
            originalArrIndex: 0,
          },
        })
      );
    });
  });

  describe('linkNodesAndEdges method', () => {
    let nodesMap;

    beforeEach(() => {
      nodesMap = {
        'key-bar': {
          children: [],
          incomingEdges: [],
          node: { id: 'bar' },
          originalArrIndex: 0,
          outgoingEdges: [],
          parents: [],
        },
        'key-foo': {
          children: [],
          incomingEdges: [],
          node: { id: 'foo' },
          originalArrIndex: 0,
          outgoingEdges: [],
          parents: [],
        },
      };
    });

    it('fills in various properties of a nodeMapNode', () => {
      const edges = [
        {
          source: 'foo',
          target: 'bar',
        },
      ];

      GraphUtils.linkNodesAndEdges(nodesMap, edges);

      expect(nodesMap['key-bar'].incomingEdges.length).toEqual(1);
      expect(nodesMap['key-bar'].incomingEdges[0]).toEqual(edges[0]);
      expect(nodesMap['key-foo'].outgoingEdges.length).toEqual(1);
      expect(nodesMap['key-foo'].outgoingEdges[0]).toEqual(edges[0]);
      expect(nodesMap['key-foo'].children.length).toEqual(1);
      expect(nodesMap['key-foo'].children[0]).toEqual(nodesMap['key-bar']);
      expect(nodesMap['key-bar'].parents.length).toEqual(1);
      expect(nodesMap['key-bar'].parents[0]).toEqual(nodesMap['key-foo']);
    });

    it('does not modify nodes if there is no matching target', () => {
      const edges = [
        {
          source: 'foo',
          target: 'fake',
        },
      ];

      GraphUtils.linkNodesAndEdges(nodesMap, edges);

      expect(nodesMap['key-foo'].outgoingEdges.length).toEqual(0);
      expect(nodesMap['key-foo'].children.length).toEqual(0);
    });

    it('does not modify nodes if there is no matching source', () => {
      const edges = [
        {
          source: 'fake',
          target: 'bar',
        },
      ];

      GraphUtils.linkNodesAndEdges(nodesMap, edges);

      expect(nodesMap['key-bar'].incomingEdges.length).toEqual(0);
      expect(nodesMap['key-bar'].parents.length).toEqual(0);
    });
  });

  describe('removeElementFromDom method', () => {
    it('removes an element using an id', () => {
      const fakeElement = {
        parentNode: {
          removeChild: jest.fn(),
        },
      };

      jest.spyOn(document, 'querySelector').mockReturnValue(fakeElement);
      const result = GraphUtils.removeElementFromDom('fake');

      expect(fakeElement.parentNode.removeChild).toHaveBeenCalledWith(
        fakeElement
      );
      expect(result).toEqual(true);
    });

    it("does nothing when it can't find the element", () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(undefined);
      const result = GraphUtils.removeElementFromDom('fake');

      expect(result).toEqual(false);
    });
  });

  describe('findParent method', () => {
    const isNotSVGGraphSelector = selector => {
      if (selector === 'svg.graph') {
        return false;
      }

      return true;
    };

    it('returns the element if an element matches a selector', () => {
      const element = {
        matches: isNotSVGGraphSelector,
      };
      const parent = GraphUtils.findParent(element, 'fake');

      expect(parent).toEqual(element);
    });

    it('returns the parent if an element contains a parentNode property', () => {
      const element = {
        matches: jest.fn().mockReturnValue(false),
        parentNode: {
          matches: isNotSVGGraphSelector,
        },
      };
      const parent = GraphUtils.findParent(element, 'fake');

      expect(parent).toEqual(element.parentNode);
    });

    it('returns null when there is no match', () => {
      const element = {
        matches: jest.fn().mockReturnValue(false),
        parentNode: {
          matches: selector => !isNotSVGGraphSelector(selector),
        },
      };
      const parent = GraphUtils.findParent(element, 'fake');

      expect(parent).toEqual(null);
    });
  });

  describe('classNames static method', () => {
    it('handles multiple string-based arguments', () => {
      const result = GraphUtils.classNames('test', 'hello');

      expect(result).toEqual('test hello');
    });

    it('handles a string and an array', () => {
      const result = GraphUtils.classNames('test', ['hello', 'world']);

      expect(result).toEqual('test hello world');
    });

    it('handles a string and object', () => {
      const result = GraphUtils.classNames('test', {
        hello: true,
        world: false,
      });

      expect(result).toEqual('test hello');
    });
  });

  describe('findNodesWithinArea', () => {
    it('findNodes', () => {
      const startPoint = { x: 0, y: 0 };
      const endPoint = { x: 100, y: 100 };
      const edges = [{ source: 'a', target: 'b' }];
      const nodes = [{ id: 'a', x: 1, y: 1 }, { id: 'b', x: 2, y: 2 }, { id: 'c' }];
      const nodeKey = 'id';

      const actual = GraphUtils.findNodesWithinArea(startPoint, endPoint, nodes, nodeKey);

      expect(actual.size).toEqual(2);
    });
  });

  describe('hasNodeShallowChanged', () => {
    it('calls isEqual', () => {
      jest.spyOn(GraphUtils, 'isEqual');
      const node1 = { x: 0, y: 1 };
      const node2 = { x: 0, y: 1 };

      GraphUtils.hasNodeShallowChanged(node1, node2);

      expect(GraphUtils.isEqual).toHaveBeenCalled();
    });

    it('does not find differences in 2 objects', () => {
      const node1 = { x: 0, y: 1 };
      const node2 = { x: 0, y: 1 };
      const changed = GraphUtils.hasNodeShallowChanged(node1, node2);

      expect(changed).toEqual(false);
    });
  });

  describe('isEqual', () => {
    it('finds differences in 2 objects', () => {
      const node1 = { x: 0, y: 1 };
      const node2 = { x: 1, y: 2 };
      const changed = GraphUtils.hasNodeShallowChanged(node1, node2);

      expect(changed).toEqual(true);
    });

    it('does not find differences in 2 objects', () => {
      const node1 = { x: 0, y: 1 };
      const node2 = { x: 0, y: 1 };
      const changed = GraphUtils.hasNodeShallowChanged(node1, node2);

      expect(changed).toEqual(false);
    });
  });
});

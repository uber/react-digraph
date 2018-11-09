// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import Edge from '../../src/components/edge';

describe('Edge component', () => {
  let output;
  let data;
  let edgeTypes;
  let sourceNode;
  let targetNode;
  let isSelected;
  beforeEach(() => {
    data = {
      handleText: 'test',
      source: 'foo',
      target: 'bar',
      type: 'fake'
    };
    edgeTypes = {
      emptyEdge: {
        shapeId: 'empty'
      },
      fake: {
        shapeId: 'blah'
      }
    };
    sourceNode = {
      x: 10,
      y: 20
    };
    targetNode = {
      x: 100,
      y: 200
    };
    isSelected = false;

    output = shallow(
      <Edge
        data={data}
        edgeTypes={edgeTypes}
        sourceNode={sourceNode}
        targetNode={targetNode}
        isSelected={isSelected}
        viewWrapperElem={document.createElement('div')}
      />
    );
  });

  describe('render method', () => {
    it('renders', () => {
      expect(output.props().className).toEqual('edge-container');
      expect(output.props()['data-source']).toEqual('foo');
      expect(output.props()['data-target']).toEqual('bar');

      const g = output.children().find('g').first();
      expect(g.props().className).toEqual('edge');

      const path = output.find('path').first();
      expect(path.props().className).toEqual('edge-path');
      expect(path.props().d).toEqual('M10,20L100,200');

      const use = output.find('use').first();
      expect(use.props().xlinkHref).toEqual('blah');
      expect(use.props().width).toEqual(50);
      expect(use.props().height).toEqual(50);
      expect(use.props().transform).toEqual('translate(55, 110) rotate(63.43494882292201) translate(-25, -25)');

      const handleText = output.find('text').first();
      expect(handleText.props().className).toEqual('edge-text');
      expect(handleText.props().textAnchor).toEqual('middle');
      expect(handleText.props().alignmentBaseline).toEqual('central');
      expect(handleText.props().transform).toEqual('translate(55, 110)');
      expect(handleText.text()).toEqual('test');

      const gMouseHandler = output.children().find('g').last();
      expect(gMouseHandler.props().className).toEqual('edge-mouse-handler');

      const pathMouseHandler = gMouseHandler.find('path').first();
      expect(pathMouseHandler.props().className).toEqual('edge-overlay-path');
      expect(pathMouseHandler.props().id).toEqual('foo_bar');
      expect(pathMouseHandler.props()['data-source']).toEqual('foo');
      expect(pathMouseHandler.props()['data-target']).toEqual('bar');
      expect(pathMouseHandler.props().d).toEqual('M10,20L100,200');
    });

    it('does not render handleText when there is none', () => {
      output.setProps({
        data: {
          ...data,
          handleText: undefined
        }
      });
      const handleText = output.find('text');
      expect(handleText.length).toEqual(0);
    });
  });

  describe('renderHandleText method', () => {
    it('returns a text element with the handleText inside', () => {
      const expectedData = {
        handleText: 'Fake'
      };
      const handleText = output.instance().renderHandleText(expectedData);
      expect(handleText.props.className).toEqual('edge-text');
      expect(handleText.props.children).toEqual('Fake');
    });
  });

  describe('getPathDescription method', () => {
    it('returns a path description', () => {
      const pathDescription = output.instance().getPathDescription(data);
      expect(pathDescription).toEqual('M10,20L100,200');
    });
  });

  describe('getEdgeHandleTransformation method', () => {
    it('returns a translation, rotation, and offset', () => {
      const handleTransformation = output.instance().getEdgeHandleTransformation(data);
      expect(handleTransformation).toEqual('translate(55, 110) rotate(63.43494882292201) translate(-25, -25)');
    });
  });

  describe('getEdgeHandleRotation method', () => {
    it('returns a rotation', () => {
      const handleRotation = output.instance().getEdgeHandleRotation();
      expect(handleRotation).toEqual('rotate(63.43494882292201)');
    });

    it('negates the response', () => {
      const handleRotation = output.instance().getEdgeHandleRotation(true);
      expect(handleRotation).toEqual('rotate(-63.43494882292201)');
    });
  });

  describe('getEdgeHandleOffsetTranslation method', () => {
    it('returns an offset translation', () => {
      const handleOffset = output.instance().getEdgeHandleOffsetTranslation();
      expect(handleOffset).toEqual('translate(-25, -25)');
    });

    it('returns an offset translation when the handleSize is not set', () => {
      output.setProps({
        edgeHandleSize: null
      });
      const handleOffset = output.instance().getEdgeHandleOffsetTranslation();
      expect(handleOffset).toEqual('translate(0, 0)');
    });
  });

  describe('getEdgeHandleTranslation method', () => {
    it('returns a translation', () => {
      const handleTranslation = output.instance().getEdgeHandleTranslation();
      expect(handleTranslation).toEqual('translate(55, 110)');
    });
  });

  describe('getXlinkHref static method', () => {
    it('returns a shapeId from the edge type', () => {
      const typeId = Edge.getXlinkHref(edgeTypes, data);
      expect(typeId).toEqual('blah');
    });

    it('returns a shapeId from the empty edge type', () => {
      data.type = 'nomatch';
      const typeId = Edge.getXlinkHref(edgeTypes, data);
      expect(typeId).toEqual('empty');
    });

    it('returns null when there is no empty or matchin edge type', () => {
      data.type = 'nomatch';
      delete edgeTypes.emptyEdge;
      const typeId = Edge.getXlinkHref(edgeTypes, data);
      expect(typeId).toEqual(null);
    });
  });

  describe('calculateOffset static method', () => {
    it('returns the x and y offset', () => {
      const nodeSize = 50;
      const offsets = Edge.calculateOffset(nodeSize, sourceNode, targetNode);
      expect(offsets.xOff).toEqual(0);
      expect(offsets.yOff).toEqual(0);
    });
  });

  describe('lineFunction static method', () => {
    it('returns a translation', () => {
      const line = Edge.lineFunction([sourceNode, targetNode]);
      expect(line).toEqual('M10,20L100,200');
    });
  });

  describe('getDistance static method', () => {
    it('returns the distance between two points', () => {
      const distance = Edge.getDistance(sourceNode, targetNode);
      expect(distance).toEqual(201.24611797498108);
    });
  });

  describe('getTheta static method', () => {
    it('returns the theta between two points', () => {
      const theta = Edge.getTheta(sourceNode, targetNode);
      expect(theta).toEqual(1.1071487177940904);
    });
  });

  // describe('getMidpoint static method', () => {
  //   it('returns the midpoint between two points', () => {
  //     const midpoint = Edge.getMidpoint(sourceNode, targetNode);
  //     expect(midpoint.x).toEqual(55);
  //     expect(midpoint.y).toEqual(110);
  //   });
  // });
});

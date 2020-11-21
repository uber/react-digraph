// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import Edge from '../../src/components/edge';
import { EdgeHandleText } from '../../src/components/edge-handle-text';
import { Point2D } from 'kld-intersections';

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
      type: 'fake',
    };
    edgeTypes = {
      emptyEdge: {
        shapeId: 'empty',
      },
      fake: {
        shapeId: 'blah',
      },
    };
    sourceNode = {
      x: 10,
      y: 20,
    };
    targetNode = {
      x: 100,
      y: 200,
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

      const g = output
        .children()
        .find('g')
        .first();

      expect(g.props().className).toEqual('edge fake');

      const path = output.find('path').first();

      expect(path.props().className).toEqual('edge-path');
      expect(path.props().d).toEqual('M10,20L100,200');

      const use = output.find('use').first();

      expect(use.props().href).toEqual('blah');
      expect(use.props().width).toEqual(50);
      expect(use.props().height).toEqual(50);
      expect(use.props().transform).toEqual(
        'translate(55, 110) rotate(63.43494882292201) translate(-25, -25)'
      );

      const handleText = output.find(EdgeHandleText);

      expect(handleText.props().handleText).toEqual('test');
      expect(handleText.props().edgeHandleTranslation).toEqual(
        'translate(55, 110)'
      );

      const gMouseHandler = output
        .children()
        .find('g')
        .last();

      expect(gMouseHandler.props().className).toEqual('edge-mouse-handler');

      const pathMouseHandler = gMouseHandler.find('path').first();

      expect(pathMouseHandler.props().className).toEqual('edge-overlay-path');
      expect(pathMouseHandler.props().id).toEqual('foo_bar');
      expect(pathMouseHandler.props()['data-source']).toEqual('foo');
      expect(pathMouseHandler.props()['data-target']).toEqual('bar');
      expect(pathMouseHandler.props().d).toEqual('M10,20L100,200');
    });
  });
});

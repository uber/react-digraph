// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import ArrowheadMarker from '../../src/components/arrowhead-marker';
import BackgroundPattern from '../../src/components/background-pattern';
import Defs from '../../src/components/defs';
import DropshadowFilter from '../../src/components/dropshadow-filter';

describe('Circle component', () => {
  let output;
  let nodeTypes;
  let nodeSubtypes;
  let edgeTypes;

  beforeEach(() => {
    nodeTypes = {
      testType: {
        shape: <circle id="nodeTypeCircle" />,
      },
    };
    nodeSubtypes = {
      testSubtype: {
        shape: <rect id="nodeSubtypeRect" />,
      },
    };
    edgeTypes = {
      testEdgeType: {
        shape: <path id="edgePath" />,
      },
    };

    output = shallow(
      <Defs
        nodeTypes={nodeTypes}
        nodeSubtypes={nodeSubtypes}
        edgeTypes={edgeTypes}
      />
    );
  });

  describe('render method', () => {
    it('renders without optional props', () => {
      expect(output.find(ArrowheadMarker).length).toEqual(1);
      expect(output.find(ArrowheadMarker).props().edgeArrowSize).toEqual(8);
      expect(output.find(BackgroundPattern).length).toEqual(1);
      expect(output.find(BackgroundPattern).props().gridSpacing).toEqual(36);
      expect(output.find(BackgroundPattern).props().gridDotSize).toEqual(2);
      expect(output.find(DropshadowFilter).length).toEqual(1);
    });

    it('renders with optional props', () => {
      output.setProps({
        edgeArrowSize: 4,
        gridDotSize: 3,
        gridSpacing: 10,
      });
      expect(output.find(ArrowheadMarker).props().edgeArrowSize).toEqual(4);
      expect(output.find(BackgroundPattern).props().gridSpacing).toEqual(10);
      expect(output.find(BackgroundPattern).props().gridDotSize).toEqual(3);
    });

    it('uses the renderDefs prop callback', () => {
      output.setProps({
        // eslint-disable-next-line react/display-name
        renderDefs: () => {
          return <ellipse id="renderDefsEllipse" />;
        },
      });

      expect(output.find('ellipse').length).toEqual(1);
      expect(output.find('ellipse').props().id).toEqual('renderDefsEllipse');
    });
  });
});

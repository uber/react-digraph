// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import ArrowheadMarker from '../../src/components/arrowhead-marker';

describe('ArrowheadMarker component', () => {
  let output = null;

  beforeEach(() => {
    output = shallow(<ArrowheadMarker />);
  });

  describe('render method', () => {
    it('renders without props', () => {
      expect(output.props().id).toEqual('end-arrow');
      expect(output.props().viewBox).toEqual('0 -4 8 8');
      expect(output.props().refX).toEqual('4');
      expect(output.props().markerWidth).toEqual('8');
      expect(output.props().markerHeight).toEqual('8');

      expect(output.children().length).toEqual(1);
      const arrowPathProps = output
        .children()
        .first()
        .props();

      expect(arrowPathProps.className).toEqual('arrow');
      expect(arrowPathProps.d).toEqual('M0,-4L8,0L0,4');
    });

    it('renders with props', () => {
      output.setProps({
        edgeArrowSize: 3,
      });
      expect(output.props().viewBox).toEqual('0 -1.5 3 3');
      expect(output.props().refX).toEqual('1.5');
      expect(output.props().markerWidth).toEqual('3');
      expect(output.props().markerHeight).toEqual('3');

      const arrowPathProps = output
        .children()
        .first()
        .props();

      expect(arrowPathProps.d).toEqual('M0,-1.5L3,0L0,1.5');
    });

    it('renders without an edge arrow', () => {
      output.setProps({
        edgeArrowSize: 0,
      });

      expect(output.getElement()).toBeNull();
    });
  });
});

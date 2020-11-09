// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import BackgroundPattern from '../../src/components/background-pattern';

describe('BackgroundPattern component', () => {
  let output = null;

  beforeEach(() => {
    output = shallow(<BackgroundPattern />);
  });

  describe('render method', () => {
    it('renders without props', () => {
      expect(output.props().id).toEqual('grid');
      expect(output.props().width).toEqual(undefined);
      expect(output.props().height).toEqual(undefined);
      expect(output.props().patternUnits).toEqual('userSpaceOnUse');
    });

    it('renders with props', () => {
      output.setProps({
        gridDotSize: 3,
        gridSpacing: 10,
      });
      expect(output.props().width).toEqual(10);
      expect(output.props().height).toEqual(10);
      expect(output.children().length).toEqual(1);
      const circleProps = output
        .children()
        .first()
        .props();

      expect(circleProps.gridSpacing).toEqual(10);
      expect(circleProps.gridDotSize).toEqual(3);
    });
  });
});

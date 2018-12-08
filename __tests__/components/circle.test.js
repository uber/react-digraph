// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import Circle from '../../src/components/circle';

describe('Circle component', () => {
  let output = null;

  beforeEach(() => {
    output = shallow(<Circle />);
  });

  describe('render method', () => {
    it('renders without props', () => {
      expect(output.props().className).toEqual('circle');
      expect(output.props().cx).toEqual(18);
      expect(output.props().cy).toEqual(18);
      expect(output.props().r).toEqual(2);
    });

    it('renders with props', () => {
      output.setProps({
        gridDotSize: 3,
        gridSpacing: 10
      });
      expect(output.props().className).toEqual('circle');
      expect(output.props().cx).toEqual(5);
      expect(output.props().cy).toEqual(5);
      expect(output.props().r).toEqual(3);
    });
  });
});

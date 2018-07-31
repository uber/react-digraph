// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import Background from '../../src/components/background';

describe('Background component', () => {
  let output = null;

  beforeEach(() => {
    output = shallow(<Background />);
  });

  describe('render method', () => {
    it('renders without props', () => {
      expect(output.props().className).toEqual('background');
      expect(output.props().x).toEqual(-10240);
      expect(output.props().y).toEqual(-10240);
      expect(output.props().width).toEqual(40960);
      expect(output.props().height).toEqual(40960);
      expect(output.props().fill).toEqual('url(#grid)');
    });

    it('renders with props', () => {
      output.setProps({
        backgroundFillId: '#test',
        gridSize: 400
      });
      expect(output.props().x).toEqual(-100);
      expect(output.props().y).toEqual(-100);
      expect(output.props().width).toEqual(400);
      expect(output.props().height).toEqual(400);
      expect(output.props().fill).toEqual('url(#test)');
    });
  });
});

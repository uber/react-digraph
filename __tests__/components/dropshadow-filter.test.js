// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import DropshadowFilter from '../../src/components/dropshadow-filter';

describe('DropshadowFilter component', () => {
  let output = null;

  beforeEach(() => {
    output = shallow(<DropshadowFilter />);
  });

  describe('render method', () => {
    it('renders', () => {
      expect(output.props().id).toEqual('dropshadow');
      expect(output.props().height).toEqual('130%');

      const feGaussianBlur = output.find('feGaussianBlur');
      expect(feGaussianBlur.props().in).toEqual('SourceAlpha');
      expect(feGaussianBlur.props().stdDeviation).toEqual('3');

      const feOffset = output.find('feOffset');
      expect(feOffset.props().dx).toEqual('2');
      expect(feOffset.props().dy).toEqual('2');
      expect(feOffset.props().result).toEqual('offsetblur');

      const feFuncA = output.find('feComponentTransfer>feFuncA');
      expect(feFuncA.props().type).toEqual('linear');
      expect(feFuncA.props().slope).toEqual('0.1');

      const feMergeNode = output.find('feMerge>feMergeNode');
      expect(feMergeNode.length).toEqual(2);
      expect(feMergeNode.last().props().in).toEqual('SourceGraphic');
    });
  });
});

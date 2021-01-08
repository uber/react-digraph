// @flow

import * as React from 'react';
import { shallow } from 'enzyme';
import GraphControls from '../../src/components/graph-controls';

describe('GraphControls component', () => {
  let output = null;
  let zoomToFit;
  let modifyZoom;

  beforeEach(() => {
    zoomToFit = jest.fn();
    modifyZoom = jest.fn();
    output = shallow(
      <GraphControls
        zoomLevel={0}
        zoomToFit={zoomToFit}
        modifyZoom={modifyZoom}
      />
    );
  });

  describe('render method', () => {
    it('renders', () => {
      expect(output.props().className).toEqual('graph-controls');
      expect(
        output
          .children()
          .first()
          .props().className
      ).toEqual('slider-wrapper');

      const rangeInput = output.find('input.slider');

      expect(rangeInput.length).toEqual(1);
      expect(rangeInput.props().type).toEqual('range');
      expect(rangeInput.props().min).toEqual(0);
      expect(rangeInput.props().max).toEqual(100);
      expect(rangeInput.props().value).toEqual(-11.11111111111111);
      expect(rangeInput.props().step).toEqual('1');
    });

    it('renders with a custom min and max zoom', () => {
      output.setProps({
        maxZoom: 0.9,
        minZoom: 0,
      });
      const rangeInput = output.find('input.slider');

      expect(rangeInput.props().min).toEqual(0);
      expect(rangeInput.props().max).toEqual(100);
      expect(rangeInput.props().value).toEqual(0);
    });

    it('zooms on change', () => {
      const rangeInput = output.find('input');

      rangeInput.simulate('change', {
        target: {
          value: 55,
        },
      });
      expect(modifyZoom).toHaveBeenCalledWith(0.8925000000000001);
    });

    it('converts a zoomLevel value to a decimal-based slider position', () => {
      output = shallow(
        <GraphControls
          zoomLevel={10}
          zoomToFit={zoomToFit}
          modifyZoom={modifyZoom}
        />
      );

      const inputElem = output.find('input');

      expect(inputElem.props().value).toEqual(729.6296296296296);
    });
  });

  describe('zoom method', () => {
    it('calls modifyZoom callback with the new zoom delta', () => {
      const inputElem = output.find('input');

      inputElem.simulate('change', { target: { value: 55 } });

      expect(modifyZoom).toHaveBeenCalledWith(0.8925000000000001);
    });

    it('does not call modifyZoom callback when the zoom level is greater than max', () => {
      const inputElem = output.find('input');

      inputElem.simulate('change', { target: { value: 101 } });

      expect(modifyZoom).not.toHaveBeenCalled();
    });

    it('does not call modifyZoom callback when the zoom level is less than min', () => {
      const inputElem = output.find('input');

      inputElem.simulate('change', { target: { value: -1 } });

      expect(modifyZoom).not.toHaveBeenCalled();
    });
  });
});

// @flow

import * as React from 'react';

import { shallow } from 'enzyme';

import NodeText from '../../src/components/node-text';

describe('NodeText component', () => {
  let output = null;
  let nodeData;
  let nodeTypes;

  beforeEach(() => {
    nodeData = {
      title: 'Test',
      type: 'fake',
    };
    nodeTypes = {
      fake: {
        typeText: 'Fake',
      },
    };
    output = shallow(
      <NodeText data={nodeData} nodeTypes={nodeTypes} isSelected={false} />
    );
  });

  describe('render method', () => {
    it('renders', () => {
      expect(output.props().className).toEqual('node-text');
      const tspan = output.find('tspan');

      expect(tspan.at(0).text()).toEqual('Fake');
      expect(tspan.at(1).text()).toEqual('Test');
      expect(tspan.at(1).props().x).toEqual(0);
      expect(tspan.at(1).props().dy).toEqual(18);
      const title = output.find('title');

      expect(title.at(0).text()).toEqual('Test');
    });

    it('renders as selected', () => {
      output.setProps({
        isSelected: true,
      });
      expect(output.props().className).toEqual('node-text selected');
    });

    it('does not render a title element when there is no title', () => {
      nodeData.title = null;
      output.setProps({
        nodeData,
      });
      const tspan = output.find('tspan');
      const title = output.find('title');

      expect(tspan.length).toEqual(1);
      expect(title.length).toEqual(0);
    });

    it('truncates node title characters when maxTitleChars is supplied', () => {
      output.setProps({
        maxTitleChars: 2,
      });
      const tspan = output.find('tspan');

      expect(tspan.at(1).text()).toEqual('Te');
    });
  });

  describe('getTypeText method', () => {
    it('returns the node typeText', () => {
      const typeTextElem = output.find('text>tspan').at(0);

      expect(typeTextElem.text()).toEqual('Fake');
    });

    it('returns the emptyNode typeText', () => {
      nodeData.type = 'notFound';
      nodeTypes.emptyNode = {
        typeText: 'Empty',
      };
      output = shallow(
        <NodeText data={nodeData} nodeTypes={nodeTypes} isSelected={false} />
      );
      const typeTextElem = output.find('text>tspan').at(0);

      expect(typeTextElem.text()).toEqual('Empty');
    });

    it('returns null when the type is not available and there is no emptyNode', () => {
      nodeData.type = 'notFound';
      nodeData.title = null;
      output = shallow(
        <NodeText data={nodeData} nodeTypes={nodeTypes} isSelected={false} />
      );
      const typeTextElems = output.find('text>tspan');

      expect(typeTextElems.length).toEqual(0);
    });
  });
});

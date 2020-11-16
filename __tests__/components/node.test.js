// @flow

import * as React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import Node from '../../src/components/node';
import NodeText from '../../src/components/node-text';
import NodeShape from '../../src/components/node-shape';
import { act } from 'react-dom/test-utils';

// jest.mock('d3');

describe('Node component', () => {
  let output = null;
  let nodeData;
  let nodeTypes;
  let nodeSubtypes;
  let onNodeMouseEnter;
  let onNodeMouseLeave;
  let onNodeMove;
  let onNodeSelected;
  let onNodeUpdate;

  beforeEach(() => {
    nodeData = {
      uuid: '1',
      title: 'Test',
      type: 'emptyNode',
      x: 5,
      y: 10,
    };

    nodeTypes = {
      emptyNode: {
        shapeId: '#test',
      },
    };

    nodeSubtypes = {};

    onNodeMouseEnter = jest.fn();
    onNodeMouseLeave = jest.fn();
    onNodeMove = jest.fn();
    onNodeSelected = jest.fn();
    onNodeUpdate = jest.fn();

    jest.spyOn(document, 'querySelector').mockReturnValue({
      getAttribute: jest.fn().mockReturnValue(100),
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 0,
        height: 0,
      }),
    });

    // this gets around d3 being readonly, we need to customize the event object
    // const globalEvent = {
    //   sourceEvent: {},
    // };

    output = mount(
      <Node
        data={nodeData}
        index={0}
        id="test-node"
        nodeKey="uuid"
        nodeTypes={nodeTypes}
        nodeSubtypes={nodeSubtypes}
        nodeSize={100}
        isSelected={false}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeMove={onNodeMove}
        onNodeSelected={onNodeSelected}
        onNodeUpdate={onNodeUpdate}
      />
    );
  });

  describe('render method', () => {
    it('renders', () => {
      const gElement = output.children().at(0);

      expect(gElement.props().className).toEqual('node emptyNode');
      expect(gElement.props().transform).toEqual('translate(5, 10)');
      const nodeShape = output.find(NodeShape);

      expect(nodeShape.props().data).toEqual({
        title: 'Test',
        type: 'emptyNode',
        uuid: '1',
        x: 5,
        y: 10,
      });
      expect(nodeShape.props().nodeSize).toEqual(100);
      expect(nodeShape.props().nodeHeight).not.toBeDefined();
      expect(nodeShape.props().nodeWidth).not.toBeDefined();
      expect(nodeShape.props().selected).toEqual(false);
      expect(nodeShape.props().hovered).toEqual(false);

      const nodeText = output.find(NodeText);

      expect(nodeText.length).toEqual(1);
    });

    it('calls handleMouseOver', () => {
      const event = {
        test: true,
      };

      act(() => {
        const node = output.find('g').at(0);

        node.props().onMouseOver(event);
      });

      expect(onNodeMouseEnter).toHaveBeenCalledWith(event, nodeData);
    });

    it('calls handleMouseOut', () => {
      const event = {
        test: true,
      };

      act(() => {
        const node = output.find('g').at(0);

        node.props().onMouseOver(event);
        node.props().onMouseOut(event);
      });

      expect(onNodeMouseLeave).toHaveBeenCalledWith(event, nodeData);
    });
  });

  describe('renderText method', () => {
    let renderNodeText;

    beforeEach(() => {
      renderNodeText = jest.fn().mockReturnValue('success');
    });

    it('calls the renderNodeText callback', () => {
      act(() => {
        output.setProps({
          renderNodeText,
        });

        output.update();
      });

      expect(renderNodeText).toHaveBeenCalledWith(nodeData, 'test-node', false);
      expect(output.text()).toEqual('success');
    });

    it('creates its own NodeText element', () => {
      expect(output.find(NodeText)).toHaveLength(1);
    });
  });
});

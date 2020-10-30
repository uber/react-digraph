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

    // Object.defineProperty(d3, 'event', {
    //   get: () => {
    //     return globalEvent;
    //   },
    //   set: event => {
    //     globalEvent = event;
    //   },
    // });
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
        output
          .find('g.node')
          .props()
          .onMouseOver(event);
      });

      expect(onNodeMouseEnter).toHaveBeenCalledWith(event, nodeData, true);
    });

    it('calls handleMouseOut', () => {
      const event = {
        test: true,
      };

      act(() => {
        output
          .find('g.node')
          .props()
          .onMouseOver(event);

        output
          .find('g.node')
          .props()
          .onMouseOut(event);
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

  describe.skip('getNodeSubtypeXlinkHref method', () => {
    it('returns the shapeId from the nodeSubtypes object', () => {
      nodeData.subtype = 'fake';
      nodeSubtypes.fake = {
        shapeId: '#blah',
      };

      const result = Node.getNodeSubtypeXlinkHref(nodeData, nodeSubtypes);

      expect(result).toEqual('#blah');
    });

    it('returns the emptyNode shapeId from the nodeSubtypes object', () => {
      nodeSubtypes.emptyNode = {
        shapeId: '#empty',
      };

      const result = Node.getNodeSubtypeXlinkHref(nodeData, nodeSubtypes);

      expect(result).toEqual('#empty');
    });

    it('returns null', () => {
      const result = Node.getNodeSubtypeXlinkHref(nodeData, nodeSubtypes);

      expect(result).toEqual(null);
    });
  });

  describe.skip('getNodeTypeXlinkHref method', () => {
    beforeEach(() => {
      nodeData.type = 'fake';
    });

    it('returns the shapeId from the nodeTypes object', () => {
      nodeTypes.fake = {
        shapeId: '#blah',
      };

      const result = Node.getNodeTypeXlinkHref(nodeData, nodeTypes);

      expect(result).toEqual('#blah');
    });

    it('returns the emptyNode shapeId from the nodeTypes object', () => {
      nodeTypes.emptyNode = {
        shapeId: '#empty',
      };

      const result = Node.getNodeTypeXlinkHref(nodeData, nodeTypes);

      expect(result).toEqual('#empty');
    });

    it('returns null', () => {
      delete nodeTypes.emptyNode;
      const result = Node.getNodeTypeXlinkHref(nodeData, nodeTypes);

      expect(result).toEqual(null);
    });
  });

  describe.skip('handleMouseOut method', () => {
    it('sets hovered to false and calls the onNodeMouseLeave callback', () => {
      const event = {
        test: true,
      };

      output.setState({
        hovered: true,
      });
      output.instance().handleMouseOut(event);
      expect(output.state().hovered).toEqual(false);
      expect(onNodeMouseLeave).toHaveBeenCalledWith(event, nodeData);
    });
  });

  describe.skip('handleMouseOver method', () => {
    it('calls the onNodeMouseEnter callback with the mouse down', () => {
      // this test cares about the passed-in event
      const event = {
        buttons: 1,
      };

      output.setState({
        hovered: false,
      });
      output.instance().handleMouseOver(event);
      expect(output.state().hovered).toEqual(false);
      expect(onNodeMouseEnter).toHaveBeenCalledWith(event, nodeData, false);
    });

    it('sets hovered to true when the mouse is not down', () => {
      const event = {
        buttons: 0,
      };

      output.setState({
        hovered: false,
      });
      output.instance().handleMouseOver(event);
      expect(output.state().hovered).toEqual(true);
      expect(onNodeMouseEnter).toHaveBeenCalledWith(event, nodeData, true);
    });
  });

  describe.skip('handleDragEnd method', () => {
    it('updates and selects the node using the callbacks', () => {
      output.instance().nodeRef = {
        current: {
          parentElement: null,
        },
      };

      output.instance().handleDragEnd({
        sourceEvent: {
          shiftKey: true,
        },
      });
      expect(onNodeUpdate).toHaveBeenCalledWith({ x: 5, y: 10 }, '1', true);
      expect(onNodeSelected).toHaveBeenCalledWith(nodeData, '1', true, {
        shiftKey: true,
      });
    });

    it('moves the element back to the original DOM position', () => {
      const insertBefore = jest.fn();

      output.instance().nodeRef.current = {
        parentElement: 'blah',
      };
      output.instance().oldSibling = {
        parentElement: {
          insertBefore,
        },
      };

      output.instance().handleDragEnd({
        sourceEvent: {
          shiftKey: true,
        },
      });
      expect(insertBefore).toHaveBeenCalledWith(
        'blah',
        output.instance().oldSibling
      );
    });
  });

  describe.skip('handleDragStart method', () => {
    let grandparent;
    let parentElement;

    beforeEach(() => {
      grandparent = {
        appendChild: jest.fn(),
      };
      parentElement = {
        nextSibling: 'blah',
        parentElement: grandparent,
      };
      output.instance().nodeRef.current = {
        parentElement,
      };
    });

    it('assigns an oldSibling so that the element can be put back', () => {
      output.instance().nodeRef.current = {
        parentElement,
      };

      output.instance().handleDragStart();

      expect(output.instance().oldSibling).toEqual('blah');
      expect(grandparent).toEqual(grandparent);
    });

    it('moves the element in the DOM', () => {
      output.instance().oldSibling = {};
      output.instance().handleDragStart();
      expect(grandparent).toEqual(grandparent);
    });
  });

  describe.skip('handleMouseMove method', () => {
    it('calls the onNodeMove callback', () => {
      output.instance().handleMouseMove({
        sourceEvent: {
          buttons: 0,
        },
      });
      expect(onNodeMove).not.toHaveBeenCalled();
    });

    it('calls the onNodeMove callback with the shiftKey pressed', () => {
      const event = {
        sourceEvent: {
          buttons: 1,
          shiftKey: true,
        },
        x: 20,
        y: 50,
      };

      output.instance().handleMouseMove(event);
      expect(onNodeMove).toHaveBeenCalledWith(
        { pointerOffset: null, x: 20, y: 50 },
        '1',
        true
      );
    });

    it('calls the onNodeMove callback with the shiftKey not pressed', () => {
      const event = {
        sourceEvent: {
          buttons: 1,
          shiftKey: false,
        },
        x: 20,
        y: 50,
      };

      output.instance().handleMouseMove(event);
      expect(onNodeMove).toHaveBeenCalledWith(
        { pointerOffset: null, x: 20, y: 50 },
        '1',
        false
      );
    });

    it('uses a layoutEngine to obtain a new position', () => {
      const layoutEngine = {
        getPositionForNode: jest.fn().mockImplementation(newState => {
          return {
            x: 100,
            y: 200,
          };
        }),
      };

      output.setProps({
        layoutEngine,
      });

      const event = {
        sourceEvent: {
          buttons: 1,
          shiftKey: false,
        },
        x: 20,
        y: 50,
      };

      output.instance().handleMouseMove(event);

      expect(onNodeMove).toHaveBeenCalledWith(
        { pointerOffset: null, x: 100, y: 200 },
        '1',
        false
      );
    });
  });
});

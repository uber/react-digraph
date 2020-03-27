// @flow

import * as React from 'react';

import { shallow, ShallowWrapper } from 'enzyme';

import Node from '../../src/components/node';
import NodeText from '../../src/components/node-text';

describe('Node component', () => {
  describe('draggable', () => {
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

      onNodeMouseEnter = jasmine.createSpy();
      onNodeMouseLeave = jasmine.createSpy();
      onNodeMove = jasmine.createSpy();
      onNodeSelected = jasmine.createSpy();
      onNodeUpdate = jasmine.createSpy();

      spyOn(document, 'querySelector').and.returnValue({
        getAttribute: jasmine.createSpy().and.returnValue(100),
        getBoundingClientRect: jasmine.createSpy().and.returnValue({
          width: 0,
          height: 0,
        }),
      });

      output = shallow(
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
        const draggable = output.find('Draggable');

        expect(draggable.length).toEqual(1);

        const node = output.find('g').first();

        expect(node.props().className).toEqual('node emptyNode');

        const nodeShape = output.find('.shape > use');

        expect(nodeShape.props()['data-index']).toEqual(0);
        expect(nodeShape.props().className).toEqual('node');
        expect(nodeShape.props().x).toEqual(-50);
        expect(nodeShape.props().y).toEqual(-50);
        expect(nodeShape.props().width).toEqual(100);
        expect(nodeShape.props().height).toEqual(100);
        expect(nodeShape.props().xlinkHref).toEqual('#test');

        const nodeText = output.find(NodeText);

        expect(nodeText.length).toEqual(1);
      });

      it('calls handleMouseOver', () => {
        const event = {
          test: true,
        };

        output
          .find('g.node')
          .props()
          .onMouseOver(event);
        expect(onNodeMouseEnter).toHaveBeenCalledWith(event, nodeData, true);
      });

      it('calls handleMouseOut', () => {
        const event = {
          test: true,
        };

        output.setState({
          hovered: true,
        });

        output
          .find('g.node')
          .props()
          .onMouseOut(event);
        expect(onNodeMouseLeave).toHaveBeenCalledWith(event, nodeData);
        expect(output.state().hovered).toEqual(false);
      });
    });

    describe('renderText method', () => {
      let renderNodeText;

      beforeEach(() => {
        renderNodeText = jasmine.createSpy().and.returnValue('success');
      });

      it('calls the renderNodeText callback', () => {
        output.setProps({
          renderNodeText,
        });

        const result = output.instance().renderText();

        expect(renderNodeText).toHaveBeenCalledWith(nodeData, 'test-node', false);
        expect(result).toEqual('success');
      });

      it('creates its own NodeText element', () => {
        const result = output.instance().renderText();

        expect(renderNodeText).not.toHaveBeenCalled();
        expect(result.type.prototype.constructor.name).toEqual('NodeText');
      });
    });

    describe('renderShape method', () => {
      let renderNode;

      beforeEach(() => {
        renderNode = jasmine.createSpy().and.returnValue('success');
      });

      it('calls the renderNode callback', () => {
        output.setProps({
          renderNode,
        });

        const result = output.instance().renderShape();

        expect(renderNode).toHaveBeenCalledWith(
          output.instance().nodeRef,
          nodeData,
          '1',
          false,
          false
        );
        expect(result).toEqual('success');
      });

      it('returns a node shape without a subtype', () => {
        const result: ShallowWrapper<any, any> = shallow(
          output.instance().renderShape()
        );

        expect(renderNode).not.toHaveBeenCalledWith();
        expect(result.props().className).toEqual('shape');
        expect(result.props().height).toEqual(100);
        expect(result.props().width).toEqual(100);

        const nodeShape = result.find('.node');
        const nodeSubtypeShape = result.find('.subtype-shape');

        expect(nodeShape.length).toEqual(1);
        expect(nodeSubtypeShape.length).toEqual(0);

        expect(nodeShape.props()['data-index']).toEqual(0);
        expect(nodeShape.props().className).toEqual('node');
        expect(nodeShape.props().x).toEqual(-50);
        expect(nodeShape.props().y).toEqual(-50);
        expect(nodeShape.props().width).toEqual(100);
        expect(nodeShape.props().height).toEqual(100);
        expect(nodeShape.props().xlinkHref).toEqual('#test');
      });

      it('returns a node shape with a subtype', () => {
        nodeData.subtype = 'fake';
        nodeSubtypes.fake = {
          shapeId: '#blah',
        };
        output.setProps({
          data: nodeData,
          nodeSubtypes,
        });
        const result: ShallowWrapper<any, any> = shallow(
          output.instance().renderShape()
        );
        const nodeSubtypeShape = result.find('.subtype-shape');

        expect(nodeSubtypeShape.length).toEqual(1);
        expect(nodeSubtypeShape.props()['data-index']).toEqual(0);
        expect(nodeSubtypeShape.props().className).toEqual('subtype-shape');
        expect(nodeSubtypeShape.props().x).toEqual(-50);
        expect(nodeSubtypeShape.props().y).toEqual(-50);
        expect(nodeSubtypeShape.props().width).toEqual(100);
        expect(nodeSubtypeShape.props().height).toEqual(100);
        expect(nodeSubtypeShape.props().xlinkHref).toEqual('#blah');
      });
    });

    describe('getNodeSubtypeXlinkHref method', () => {
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

    describe('getNodeTypeXlinkHref method', () => {
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

    describe('handleMouseOut method', () => {
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

    describe('handleMouseOver method', () => {
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

    describe('handleDragEnd method', () => {
      beforeEach(() => {
        output.instance().nodeRef = {
          current: {
            parentElement: null,
          },
        };
      });

      it('updates and selects the node using the callbacks', () => {
        output.instance().handleDragEnd({
          shiftKey: true,
        });
        expect(onNodeUpdate).toHaveBeenCalledWith({ x: 5, y: 10 }, '1', true);
      });

      it('uses a layoutEngine to obtain a new position', () => {
        const layoutEngine = {
          getPositionForNode: jasmine.createSpy().and.callFake(newState => {
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
          shiftKey: false,
        };

        output.instance().handleDragEnd(event);

        expect(onNodeUpdate).toHaveBeenCalledWith({ x: 5, y: 10 }, '1', false);
        expect(output.state('x')).toEqual(100);
        expect(output.state('y')).toEqual(200);
      });
    });

    describe('handleDragStart method', () => {
      let grandparent;
      let parentElement;

      beforeEach(() => {
        grandparent = {
          appendChild: jasmine.createSpy,
        };
        parentElement = {
          nextSibling: 'blah',
          parentElement: grandparent,
        };
        output.instance().nodeRef.current = {
          parentElement,
        };
      });

      it('moves the element in the DOM', () => {
        output.instance().oldSibling = {};
        output.instance().handleDragStart({
          sourceEvent: {
            shiftKey: true,
          },
        });
        expect(grandparent).toEqual(grandparent);
      });
    });

    describe('handleMouseMove method', () => {
      let grandparent;
      let parentElement;

      beforeEach(() => {
        grandparent = {
          appendChild: jasmine.createSpy,
        };
        parentElement = {
          nextSibling: 'blah',
          parentElement: grandparent,
        };
        output.instance().nodeRef.current = {
          parentElement,
        };
      });

      it('calls the onNodeMove callback', () => {
        output.instance().handleMouseMove({
          buttons: 0,
        });
        expect(onNodeMove).not.toHaveBeenCalled();
      });

      it('calls the onNodeMove callback with the shiftKey pressed', () => {
        const event = {
          buttons: 1,
          shiftKey: true,
        };
        const data = { x: 20, y: 50 };

        output.instance().handleMouseMove(event, data);
        expect(onNodeMove).toHaveBeenCalledWith({ x: 20, y: 50 }, '1', true);
      });

      it('calls the onNodeMove callback with the shiftKey not pressed', () => {
        const event = {
          buttons: 1,
          shiftKey: false,
        };
        const data = {
          x: 20,
          y: 50,
        };

        output.instance().handleMouseMove(event, data);
        expect(onNodeMove).toHaveBeenCalledWith({ x: 20, y: 50 }, '1', false);
      });
    });
  });

  describe('readOnly', () => {
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
        readOnly: true,
      };

      nodeTypes = {
        emptyNode: {
          shapeId: '#test',
        },
      };

      nodeSubtypes = {};

      onNodeMouseEnter = jasmine.createSpy();
      onNodeMouseLeave = jasmine.createSpy();
      onNodeMove = jasmine.createSpy();
      onNodeSelected = jasmine.createSpy();
      onNodeUpdate = jasmine.createSpy();

      spyOn(document, 'querySelector').and.returnValue({
        getAttribute: jasmine.createSpy().and.returnValue(100),
        getBoundingClientRect: jasmine.createSpy().and.returnValue({
          width: 0,
          height: 0,
        }),
      });

      output = shallow(
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

    it('renders', () => {
      const draggable = output.find('Draggable');

      expect(draggable.length).toEqual(0);

      const node = output.find('g').first();

      expect(node.props().className).toEqual('node emptyNode');
      expect(node.props().transform).toEqual('translate(5, 10)');

      const nodeShape = output.find('.shape > use');

      expect(nodeShape.length).toEqual(1);

      const nodeText = output.find(NodeText);

      expect(nodeText.length).toEqual(1);
    });
  });
});

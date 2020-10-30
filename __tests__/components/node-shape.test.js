// @flow

import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import NodeShape from '../../src/components/node-shape';

describe('NodeShape component', () => {
  let output;
  let nodeData;
  let nodeTypes;
  let nodeSubtypes;

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

    output = shallow(
      <NodeShape
        data={nodeData}
        nodeTypes={nodeTypes}
        nodeSubtypes={nodeSubtypes}
        nodeKey="uuid"
        nodeSize={100}
      />
    );
  });

  it('renders', () => {
    const g = output.find('g');
    const use = g.find('use');

    expect(g.props().width).toEqual(100);
    expect(g.props().height).toEqual(100);
    expect(use.length).toEqual(1);
    expect(use.props()).toEqual({
      className: 'node',
      height: 100,
      href: '#test',
      is: 'use',
      width: 100,
      x: -50,
      y: -50,
    });
  });

  // it('calls the renderNode callback', () => {
  //   output.setProps({
  //     renderNode,
  //   });

  //   const result = output.instance().renderShape();

  //   expect(renderNode).toHaveBeenCalledWith(
  //     output.instance().nodeRef,
  //     nodeData,
  //     '1',
  //     false,
  //     false
  //   );
  //   expect(result).toEqual('success');
  // });

  // it('returns a node shape without a subtype', () => {
  //   const result: ShallowWrapper<any, any> = shallow(
  //     output.instance().renderShape()
  //   );

  //   expect(renderNode).not.toHaveBeenCalledWith();
  //   expect(result.props().className).toEqual('shape');
  //   expect(result.props().height).toEqual(100);
  //   expect(result.props().width).toEqual(100);

  //   const nodeShape = result.find('.node');
  //   const nodeSubtypeShape = result.find('.subtype-shape');

  //   expect(nodeShape.length).toEqual(1);
  //   expect(nodeSubtypeShape.length).toEqual(0);

  //   expect(nodeShape.props().className).toEqual('node');
  //   expect(nodeShape.props().x).toEqual(-50);
  //   expect(nodeShape.props().y).toEqual(-50);
  //   expect(nodeShape.props().width).toEqual(100);
  //   expect(nodeShape.props().height).toEqual(100);
  //   expect(nodeShape.props().href).toEqual('#test');
  // });

  // it('returns a node shape with a subtype', () => {
  //   nodeData.subtype = 'fake';
  //   nodeSubtypes.fake = {
  //     shapeId: '#blah',
  //   };
  //   output.setProps({
  //     data: nodeData,
  //     nodeSubtypes,
  //   });
  //   const result: ShallowWrapper<any, any> = shallow(
  //     output.instance().renderShape()
  //   );
  //   const nodeSubtypeShape = result.find('.subtype-shape');

  //   expect(nodeSubtypeShape.length).toEqual(1);
  //   expect(nodeSubtypeShape.props().className).toEqual('subtype-shape');
  //   expect(nodeSubtypeShape.props().x).toEqual(-50);
  //   expect(nodeSubtypeShape.props().y).toEqual(-50);
  //   expect(nodeSubtypeShape.props().width).toEqual(100);
  //   expect(nodeSubtypeShape.props().height).toEqual(100);
  //   expect(nodeSubtypeShape.props().href).toEqual('#blah');
  // });
});

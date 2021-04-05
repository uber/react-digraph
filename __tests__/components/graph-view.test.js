// @flow

import * as d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import Background from '../../src/components/background';
import Defs from '../../src/components/defs';
import GraphUtils from '../../src/utilities/graph-util';
import GraphView from '../../src/components/graph-view';

jest.mock('react-dom', () => {
  return {};
});

describe('GraphView component', () => {
  let output = null;
  let nodes;
  let edges;
  let nodeTypes;
  let nodeSubtypes;
  let edgeTypes;
  let selected;
  let onDeleteNode;
  let onSelectNode;
  let onCreateNode;
  let onCreateEdge;
  let onDeleteEdge;
  let onUpdateNode;
  let onSwapEdge;
  let onSelectEdge;
  let onUndo;
  let instance;
  let nodeKey;

  beforeEach(() => {
    nodes = [];
    edges = [];
    nodeTypes = {};
    nodeSubtypes = {};
    edgeTypes = {};
    selected = null;
    nodeKey = 'id';
    onDeleteNode = jest.fn();
    onSelectNode = jest.fn();
    onCreateNode = jest.fn();
    onCreateEdge = jest.fn();
    onDeleteEdge = jest.fn();
    onUpdateNode = jest.fn();
    onSwapEdge = jest.fn();
    onSelectEdge = jest.fn();
    onUndo = jest.fn();
    ReactDOM.render = jest.fn();

    jest.spyOn(document, 'querySelector').mockReturnValue({
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 0,
        height: 0,
      }),
    });

    output = shallow(
      <GraphView
        nodes={nodes}
        edges={edges}
        nodeKey={nodeKey}
        nodeTypes={nodeTypes}
        nodeSubtypes={nodeSubtypes}
        edgeTypes={edgeTypes}
        selected={selected}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        onSelectNode={onSelectNode}
        onSelectEdge={onSelectEdge}
        onCreateNode={onCreateNode}
        onCreateEdge={onCreateEdge}
        onUpdateNode={onUpdateNode}
        onSwapEdge={onSwapEdge}
        onUndo={onUndo}
      />
    );
    instance = output.instance();
  });

  describe('render method', () => {
    it('renders', () => {
      expect(output.props().className).toEqual('view-wrapper');

      expect(output.find('.graph-controls-wrapper').length).toEqual(1);

      const graph = output.find('.graph');

      expect(graph.length).toEqual(1);

      const defs = graph.find(Defs);

      expect(defs.length).toEqual(1);
      expect(defs.props().edgeArrowSize).toEqual(8);
      expect(defs.props().gridSpacing).toEqual(36);
      expect(defs.props().gridDotSize).toEqual(undefined);
      expect(defs.props().nodeTypes).toEqual(nodeTypes);
      expect(defs.props().nodeSubtypes).toEqual(nodeSubtypes);
      expect(defs.props().edgeTypes).toEqual(edgeTypes);
      expect(defs.props().renderDefs).not.toBeDefined();

      const view = graph.find('.view');
      const entities = view.find('.entities');

      expect(entities.length).toEqual(1);

      const background = view.find(Background);

      expect(background.length).toEqual(1);
    });
  });

  describe('renderGraphControls method', () => {
    beforeEach(() => {
      instance.viewWrapper = {
        current: document.createElement('div'),
      };
      instance.viewWrapper.current.width = 500;
      instance.viewWrapper.current.height = 500;
      const graphControlsWrapper = document.createElement('g');

      graphControlsWrapper.id = 'react-digraph-graph-controls-wrapper';
      graphControlsWrapper.classList.add('graph-controls-wrapper');
      instance.viewWrapper.current.appendChild(graphControlsWrapper);

      jest
        .spyOn(document, 'getElementById')
        .mockReturnValue(graphControlsWrapper);
      instance.graphControlsWrapper = graphControlsWrapper;
    });

    afterEach(() => {
      document.getElementById.mockRestore();
    });

    it('does nothing when showGraphControls is false', () => {
      output.setProps({
        showGraphControls: false,
      });
      instance.renderGraphControls();
      expect(ReactDOM.render).not.toHaveBeenCalled();

      output.setProps({
        showGraphControls: true,
      });
    });

    it('uses ReactDOM.render to async render the GraphControls', () => {
      output.setProps({
        showGraphControls: true,
      });
      output.setState({
        viewTransform: {
          k: 0.6,
        },
      });
      instance.renderGraphControls();
      expect(ReactDOM.render).toHaveBeenCalled();
    });
  });

  describe('renderEdges method', () => {
    beforeEach(() => {
      jest.spyOn(instance, 'asyncRenderEdge');
    });

    it('does nothing when there are no entities', () => {
      instance.entities = null;
      instance.renderEdges();
      expect(instance.asyncRenderEdge).not.toHaveBeenCalled();
    });

    it('does nothing while dragging an edge', () => {
      output.setState({
        draggingEdge: true,
      });
      instance.entities = [];
      instance.renderEdges();
      expect(instance.asyncRenderEdge).not.toHaveBeenCalled();
    });

    it('calls asyncRenderEdge for each edge', () => {
      output.setProps({
        edges: [
          {
            source: 'b',
            target: 'a',
          },
          {
            source: 'c',
            target: 'a',
          },
        ],
      });
      // modifying the edges will call renderEdges, we need to reset this count.
      instance.asyncRenderEdge.mockReset();
      instance.entities = [];
      instance.renderEdges();
      expect(instance.asyncRenderEdge).toHaveBeenCalledTimes(2);
    });
  });

  describe('syncRenderEdge method', () => {
    beforeEach(() => {
      jest.spyOn(instance, 'renderEdge');
      jest.spyOn(instance, 'getEdgeComponent').mockReturnValue('blah');
    });

    it('sets up a renderEdge call synchronously', () => {
      const expectedEdge = {
        source: 'a',
        target: 'b',
      };

      instance.syncRenderEdge(expectedEdge);
      expect(instance.renderEdge).toHaveBeenCalledWith(
        'edge-a-b',
        'blah',
        expectedEdge,
        false
      );
    });

    it('uses a custom idVar', () => {
      const expectedEdge = {
        source: 'a',
      };

      instance.syncRenderEdge(expectedEdge);
      expect(instance.renderEdge).toHaveBeenCalledWith(
        'edge-custom',
        'blah',
        expectedEdge,
        false
      );
    });

    it('sets up a renderEdge call synchronously when source key = 0', () => {
      const expectedEdge = {
        source: 0,
        target: 'b',
      };

      instance.syncRenderEdge(expectedEdge);
      expect(instance.renderEdge).toHaveBeenCalledWith(
        'edge-0-b',
        'blah',
        expectedEdge,
        false
      );
    });

    it('sets up a renderEdge call synchronously when target key = 0', () => {
      const expectedEdge = {
        source: 'a',
        target: 0,
      };

      instance.syncRenderEdge(expectedEdge);
      expect(instance.renderEdge).toHaveBeenCalledWith(
        'edge-a-0',
        'blah',
        expectedEdge,
        false
      );
    });
  });

  describe('asyncRenderEdge method', () => {
    beforeEach(() => {
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb();

        return true;
      });
    });
    afterEach(() => {
      window.requestAnimationFrame.mockRestore();
    });

    it('renders asynchronously', () => {
      jest.spyOn(instance, 'syncRenderEdge');
      const edge = {
        source: 'a',
        target: 'b',
      };

      instance.asyncRenderEdge(edge);

      expect(instance.edgeTimeouts['edges-a-b']).toBeDefined();
      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(instance.syncRenderEdge).toHaveBeenCalledWith(edge, false);
    });

    it('renders asynchronously when source key = 0', () => {
      jest.spyOn(instance, 'syncRenderEdge');
      const edge = {
        source: 0,
        target: 'b',
      };

      instance.asyncRenderEdge(edge);

      expect(instance.edgeTimeouts['edges-0-b']).toBeDefined();
      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(instance.syncRenderEdge).toHaveBeenCalledWith(edge, false);
    });

    it('renders asynchronously when target key = 0', () => {
      jest.spyOn(instance, 'syncRenderEdge');
      const edge = {
        source: 'a',
        target: 0,
      };

      instance.asyncRenderEdge(edge);

      expect(instance.edgeTimeouts['edges-a-0']).toBeDefined();
      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(instance.syncRenderEdge).toHaveBeenCalledWith(edge, false);
    });
  });

  describe('renderEdge method', () => {
    beforeEach(() => {
      instance.entities = {
        appendChild: jest.fn(),
      };
      ReactDOM.render = jest.fn();
    });

    it('appends an edge element into the entities element', () => {
      output.setProps({
        edges: [],
      });
      const element = document.createElement('g');
      const edge = {
        source: 'a',
        target: 'b',
      };

      const querySelectorResponse = undefined;

      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return querySelectorResponse;
          }),
        },
      };

      // using Date.getTime to make this a unique edge
      instance.renderEdge(`test-${new Date().getTime()}`, element, edge);

      expect(instance.entities.appendChild).toHaveBeenCalled();
    });

    it('replaces an edge in an existing container', () => {
      const element = document.createElement('g');
      const container = document.createElement('g');

      container.id = 'test-container';
      const edge = {
        source: 'a',
        target: 'b',
      };

      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return container;
          }),
        },
      };

      instance.renderEdge('test', element, edge);

      expect(instance.entities.appendChild).not.toHaveBeenCalled();
      expect(ReactDOM.render).toHaveBeenCalledWith(element, container);
    });
  });

  describe('getEdgeComponent method', () => {
    beforeEach(() => {
      nodes = [{ id: 'a' }, { id: 'b' }];
    });

    it('returns an Edge component', () => {
      const edge = {
        source: 'a',
        target: 'b',
      };

      output.setProps({
        nodes,
      });

      const result = instance.getEdgeComponent(edge);

      expect(result.type.prototype.constructor.name).toEqual('Edge');
      expect(result.props.data).toEqual(edge);
      expect(result.props.sourceNode).toEqual(nodes[0]);
      expect(result.props.targetNode).toEqual(nodes[1]);
    });

    it('returns null when sourceNode is not found', () => {
      const edge = {
        source: 'fake',
        target: 'b',
      };
      const result = instance.getEdgeComponent(edge);

      expect(result).toEqual(null);
    });

    it('returns null when targetNode is not found and targetPosition is not defined', () => {
      const edge = {
        source: 'a',
        target: 'fake',
      };
      const result = instance.getEdgeComponent(edge);

      expect(result).toEqual(null);
    });

    it('handles a targetPosition', () => {
      const edge = {
        source: 'a',
        targetPosition: { x: 0, y: 10 },
      };

      output.setProps({
        nodes,
      });
      const result = instance.getEdgeComponent(edge);

      expect(result.type.prototype.constructor.name).toEqual('Edge');
      expect(result.props.data).toEqual(edge);
      expect(result.props.sourceNode).toEqual(nodes[0]);
      expect(result.props.targetNode).toEqual({ x: 0, y: 10 });
    });
  });

  describe('renderNodes method', () => {
    beforeEach(() => {
      jest.spyOn(instance, 'asyncRenderNode');
      nodes = [{ id: 'a' }, { id: 'b' }];
      output.setProps({
        nodes,
      });
    });

    it('returns early when there are no entities', () => {
      // asyncRenderNode gets called when new nodes are added. Reset the calls.
      instance.asyncRenderNode.mockReset();

      instance.renderNodes();
      expect(instance.asyncRenderNode).not.toHaveBeenCalled();
    });

    it('calls asynchronously renders each node', () => {
      instance.asyncRenderNode.mockReset();
      instance.entities = [];
      instance.renderNodes();
      expect(instance.asyncRenderNode).toHaveBeenCalledTimes(2);
    });
  });

  describe('isEdgeSelected method', () => {
    let edge;

    beforeEach(() => {
      edge = {
        source: 'a',
        target: 'b',
      };
      edges.push(edge);
    });

    it('returns true when the edge is selected', () => {
      selected = { edges: new Map([[`${edge.source}_${edge.target}`, edge]]) };
      output.setProps({
        edges,
        selected,
      });

      const result = instance.isEdgeSelected(edge);

      expect(result).toEqual(true);
    });

    it('returns false when the edge is not selected', () => {
      const edge = {
        source: 'b',
        target: 'c',
      };

      selected = { edges: null }; // no edges selected
      output.setProps({
        edges,
        selected,
      });

      const result = instance.isEdgeSelected(edge);

      expect(result).toEqual(false);
    });
  });

  describe('syncRenderNode method', () => {
    it('renders a node and connected edges', () => {
      const node = { id: 'a' };
      const nodesProp = [node];

      output.setProps({
        nodeKey,
        nodes: nodesProp,
      });
      jest.spyOn(instance, 'renderNode');
      jest.spyOn(instance, 'renderConnectedEdgesFromNode');

      instance.syncRenderNode(node, 0);

      expect(instance.renderNode).toHaveBeenCalledWith(
        'node-a',
        expect.any(Object)
      );
      expect(instance.renderConnectedEdgesFromNode).toHaveBeenCalled();
    });
  });

  describe('asyncRenderNode method', () => {
    beforeEach(() => {
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb();

        return true;
      });
    });
    afterEach(() => {
      window.requestAnimationFrame.mockRestore();
    });

    it('renders asynchronously', () => {
      jest.spyOn(instance, 'syncRenderNode');
      const node = { id: 'a' };

      instance.asyncRenderNode(node);

      expect(instance.nodeTimeouts['nodes-a']).toBeDefined();
      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(instance.syncRenderNode).toHaveBeenCalledWith(node);
    });
  });

  describe('renderConnectedEdgesFromNode method', () => {
    let node;

    beforeEach(() => {
      jest.spyOn(instance, 'asyncRenderEdge');
      node = {
        id: 'a',
        incomingEdges: [{ source: 'b', target: 'a' }],
        outgoingEdges: [{ source: 'a', target: 'c' }],
      };
    });

    it('does nothing while dragging an edge', () => {
      output.setState({
        draggingEdge: true,
      });

      instance.renderConnectedEdgesFromNode(node);

      expect(instance.asyncRenderEdge).not.toHaveBeenCalled();
    });

    it('renders edges for incoming and outgoing edges', () => {
      instance.renderConnectedEdgesFromNode(node);

      expect(instance.asyncRenderEdge).toHaveBeenCalledTimes(2);
    });
  });

  describe('renderNode method', () => {
    beforeEach(() => {
      instance.entities = {
        appendChild: jest.fn(),
      };
      ReactDOM.render = jest.fn();
    });

    it('appends a node element into the entities element', () => {
      const element = document.createElement('g');

      const querySelectorResponse = undefined;

      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return querySelectorResponse;
          }),
        },
      };

      instance.renderNode('test', element);

      expect(instance.entities.appendChild).toHaveBeenCalled();
    });

    it('replaces a node in an existing container', () => {
      const element = document.createElement('g');
      const container = document.createElement('g');

      container.id = 'test-container';

      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return container;
          }),
        },
      };

      instance.renderNode('test', element);

      expect(instance.entities.appendChild).not.toHaveBeenCalled();
      expect(ReactDOM.render).toHaveBeenCalledWith(element, container);
    });
  });

  describe('getNodeComponent method', () => {
    let node;

    beforeEach(() => {
      node = { id: 'a' };
    });

    it('returns a Node', () => {
      const result = instance.getNodeComponent('test', node, 0);

      expect(result.type.prototype.constructor.name).toEqual('Node');
      expect(result.props.id).toEqual('test');
      expect(result.props.data).toEqual(node);
      expect(result.props.isSelected).toEqual(false);
    });

    it('returns a selected node', () => {
      output.setProps({
        nodes: [node],
        selected: { nodes: new Map([[node.id, node]]) },
      });
      const result = instance.getNodeComponent('test', node, 0);

      expect(result.props.isSelected).toEqual(true);
    });
  });

  describe('renderView method', () => {
    it('sets up the view and calls renderNodes asynchronously', () => {
      jest.useFakeTimers();
      jest.clearAllTimers();
      jest.spyOn(instance, 'renderNodes');
      output.setState({
        viewTransform: 'test',
      });
      instance.selectedView = d3.select(document.createElement('g'));

      instance.renderView();

      jest.runAllTimers();

      expect(instance.renderNodes).toHaveBeenCalled();
      expect(instance.selectedView.attr('transform')).toEqual('test');
    });
  });

  // TODO: figure out how to mock d3 for this test
  // describe('setZoom method', () => {
  //   it('zooms to a specified value', () => {
  //     instance.setZoom(0.5, 5, 10, 100);

  //     // expect(d3.zoomIdentity.translate.scale).toHaveBeenCalledWith(0.5);
  //   });
  // });

  describe('modifyZoom', () => {
    beforeEach(() => {
      jest.spyOn(instance, 'setZoom');
      instance.viewWrapper = {
        current: document.createElement('div'),
      };
      instance.viewWrapper.current.width = 500;
      instance.viewWrapper.current.height = 500;
      instance.setState({
        viewTransform: {
          k: 0.4,
          x: 50,
          y: 50,
        },
      });
    });

    it('modifies the zoom', () => {
      instance.modifyZoom(0.1, 5, 10, 100);
      expect(instance.setZoom).toHaveBeenCalledWith(
        0.44000000000000006,
        55,
        60,
        100
      );
    });

    it('does nothing when targetZoom is too small', () => {
      instance.modifyZoom(-100, 5, 10, 100);
      expect(instance.setZoom).not.toHaveBeenCalled();
    });

    it('does nothing when targetZoom is too large', () => {
      instance.modifyZoom(100, 5, 10, 100);
      expect(instance.setZoom).not.toHaveBeenCalled();
    });

    it('uses defaults', () => {
      instance.modifyZoom();
      expect(instance.setZoom).toHaveBeenCalledWith(0.4, 50, 50, 0);
    });
  });

  describe('handleZoomToFit method', () => {
    beforeEach(() => {
      jest.spyOn(instance, 'setZoom');
      instance.viewWrapper = {
        current: document.createElement('div'),
      };
      // this gets around instance.viewWrapper.client[Var] being readonly, we need to customize the object
      let globalWidth = 0;

      Object.defineProperty(instance.viewWrapper.current, 'clientWidth', {
        get: () => {
          return globalWidth;
        },
        set: clientWidth => {
          globalWidth = clientWidth;
        },
      });
      let globalHeight = 0;

      Object.defineProperty(instance.viewWrapper.current, 'clientHeight', {
        get: () => {
          return globalHeight;
        },
        set: clientHeight => {
          globalHeight = clientHeight;
        },
      });
      instance.viewWrapper.current.clientWidth = 500;
      instance.viewWrapper.current.clientHeight = 500;
      instance.setState({
        viewTransform: {
          k: 0.4,
          x: 50,
          y: 50,
        },
      });
      instance.entities = document.createElement('g');
      instance.entities.getBBox = jest
        .fn()
        .mockReturnValue({ width: 400, height: 300, x: 5, y: 10 });
    });

    it('modifies the zoom to fit the elements', () => {
      instance.handleZoomToFit();
      expect(instance.entities.getBBox).toHaveBeenCalled();
      expect(instance.setZoom).toHaveBeenCalledWith(1.125, 19.375, 70, 750);
    });

    it('uses defaults for minZoom and maxZoom', () => {
      output.setProps({
        maxZoom: null,
        minZoom: null,
        zoomDur: 100,
      });
      instance.handleZoomToFit();
      expect(instance.setZoom).toHaveBeenCalledWith(1.125, 19.375, 70, 100);
    });

    it('does not modify the zoom', () => {
      instance.entities.getBBox.mockReturnValue({
        width: 0,
        height: 0,
        x: 5,
        y: 5,
      });
      instance.handleZoomToFit();
      expect(instance.setZoom).toHaveBeenCalledWith(0.825, 0, 0, 750);
    });

    it('uses the maxZoom when k is greater than max', () => {
      instance.entities.getBBox.mockReturnValue({
        width: 5,
        height: 5,
        x: 5,
        y: 5,
      });
      instance.handleZoomToFit();
      expect(instance.setZoom).toHaveBeenCalledWith(1.5, 238.75, 238.75, 750);
    });

    it('uses the minZoom when k is less than min', () => {
      instance.entities.getBBox.mockReturnValue({
        width: 10000,
        height: 10000,
        x: 5,
        y: 5,
      });
      instance.handleZoomToFit();
      expect(instance.setZoom).toHaveBeenCalledWith(
        0.15,
        -500.75,
        -500.75,
        750
      );
    });
  });

  describe('handleZoomEnd method', () => {
    beforeEach(() => {
      jest.spyOn(GraphUtils, 'removeElementFromDom');
      jest.spyOn(instance, 'canSwap').mockReturnValue(false);
      jest.spyOn(instance, 'syncRenderEdge');
      output.setProps({
        edges: [{ source: 'a', target: 'b' }],
        nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      });
    });

    it('does nothing when not dragging an edge', () => {
      instance.handleZoomEnd();
      expect(GraphUtils.removeElementFromDom).not.toHaveBeenCalled();
    });

    it('does nothing when there is no dragged edge object', () => {
      output.setState({
        draggingEdge: true,
      });
      instance.handleZoomEnd();
      expect(GraphUtils.removeElementFromDom).not.toHaveBeenCalled();
    });

    it('drags an edge', () => {
      instance.canSwap.mockReturnValue(true);
      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return {};
          }),
        },
      };
      const draggedEdge = {
        source: 'a',
        target: 'b',
      };

      output.setState({
        draggedEdge,
        draggingEdge: true,
        edgeEndNode: { id: 'c' },
      });
      instance.handleZoomEnd();
      expect(GraphUtils.removeElementFromDom).toHaveBeenCalled();
      expect(output.state().draggedEdge).toEqual(null);
      expect(output.state().draggingEdge).toEqual(false);
      expect(instance.syncRenderEdge).toHaveBeenCalled();
      expect(onSwapEdge).toHaveBeenCalled();
    });

    it('handles swapping the edge to a different node', () => {
      instance.canSwap.mockReturnValue(true);
      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return {};
          }),
        },
      };
      const draggedEdge = {
        source: 'a',
        target: 'b',
      };

      output.setState({
        draggedEdge,
        draggingEdge: true,
        edgeEndNode: { id: 'c' },
      });
      instance.handleZoomEnd();
      expect(instance.syncRenderEdge).toHaveBeenCalledWith({
        source: 'a',
        target: 'c',
      });
    });
  });

  describe('handleZoom method', () => {
    let event;

    beforeEach(() => {
      jest.spyOn(instance, 'dragEdge');
      jest.spyOn(instance, 'renderGraphControls');
      event = {
        transform: 'test',
      };
      instance.view = document.createElement('g');
      instance.viewWrapper = {
        current: {
          ownerDocument: document,
        },
      };
    });

    it('handles the zoom event when a node is not hovered nor an edge is being dragged', () => {
      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return {};
          }),
        },
      };

      instance.handleZoom(event);
      expect(instance.renderGraphControls).toHaveBeenCalled();
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });

    it("does nothing when the zoom level hasn't changed", () => {
      output.setState({
        viewTransform: 'test',
      });
      instance.handleZoom(event);
      expect(instance.renderGraphControls).not.toHaveBeenCalled();
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });

    it('deals with dragging an edge', () => {
      output.setState({
        draggingEdge: true,
      });
      instance.handleZoom(event);
      expect(instance.renderGraphControls).not.toHaveBeenCalled();
      expect(instance.dragEdge).toHaveBeenCalled();
    });

    it('zooms when a node is hovered', () => {
      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return {};
          }),
        },
      };

      output.setState({
        hoveredNode: {},
      });
      instance.handleZoom(event);
      expect(instance.renderGraphControls).toHaveBeenCalled();
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });
  });

  describe('dragEdge method', () => {
    let draggedEdge;
    let mouse;

    beforeEach(() => {
      draggedEdge = {
        source: 'a',
        target: 'b',
      };
      jest.spyOn(instance, 'syncRenderEdge');
      instance.selectedView = d3.select(document.createElement('g'));
      mouse = jest.fn().mockReturnValue([5, 15]);
      output.setProps({
        nodes: [
          { id: 'a', x: 5, y: 10 },
          { id: 'b', x: 10, y: 20 },
        ],
      });
      output.setState({
        draggedEdge,
      });
    });

    it('does nothing when an edge is not dragged', () => {
      output.setState({
        draggedEdge: null,
      });
      instance.dragEdge(undefined, mouse);
      expect(instance.syncRenderEdge).not.toHaveBeenCalled();
    });

    it('drags the edge', () => {
      instance.dragEdge(undefined, mouse);
      expect(instance.syncRenderEdge).toHaveBeenCalledWith({
        source: draggedEdge.source,
        targetPosition: { x: 5, y: 15 },
      });
    });
  });

  describe('handleZoomStart method', () => {
    let edge;
    let event;

    beforeEach(() => {
      instance.dragEdge = jest.fn();
      jest.spyOn(instance, 'isArrowClicked').mockReturnValue(true);
      jest.spyOn(instance, 'removeEdgeElement');
      edge = { source: 'a', target: 'b' };
      output.setProps({
        edges: [edge],
      });
      event = {
        sourceEvent: {
          target: {
            matches: jest.fn().mockReturnValue(true),
            id: 'a_b',
          },
          buttons: 0,
        },
      };
    });

    it('does nothing when the graph is readOnly', () => {
      output.setProps({
        readOnly: true,
      });
      instance.handleZoomStart(event);
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });

    it('does nothing when there is no sourceEvent', () => {
      event = {
        sourceEvent: null,
      };
      instance.handleZoomStart(event);
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });

    it('does nothing when the sourceEvent is not an edge', () => {
      event.sourceEvent.target.matches = jest.fn().mockReturnValue(false);
      instance.handleZoomStart(event);
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });

    it("does nothing if the arrow wasn't clicked", () => {
      instance.isArrowClicked.mockReturnValue(false);
      instance.handleZoomStart(event);
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });

    it('does nothing if there is no edge', () => {
      event.sourceEvent.target.id = 'fake';
      instance.handleZoomStart(event);
      expect(instance.dragEdge).not.toHaveBeenCalled();
    });

    it('drags the edge', () => {
      instance.viewWrapper = {
        current: {
          querySelector: jest.fn().mockImplementation(selector => {
            return {};
          }),
        },
      };
      event.sourceEvent.buttons = 2;
      instance.isArrowClicked = jest.fn().mockReturnValue(true);
      instance.handleZoomStart(event);
      expect(output.state().draggedEdge).toEqual(edge);
      expect(instance.dragEdge).toHaveBeenCalled();
    });
  });

  describe('panToEntity method', () => {
    const entity = document.createElement('g');

    entity.getBBox = jest
      .fn()
      .mockReturnValue({ width: 400, height: 300, x: 5, y: 10 });
    beforeEach(() => {
      jest.spyOn(instance, 'setZoom');
      instance.viewWrapper = {
        current: document.createElement('div'),
      };
      // this gets around instance.viewWrapper.client[Var] being readonly, we need to customize the object
      let globalWidth = 0;

      Object.defineProperty(instance.viewWrapper.current, 'clientWidth', {
        get: () => {
          return globalWidth;
        },
        set: clientWidth => {
          globalWidth = clientWidth;
        },
      });
      let globalHeight = 0;

      Object.defineProperty(instance.viewWrapper.current, 'clientHeight', {
        get: () => {
          return globalHeight;
        },
        set: clientHeight => {
          globalHeight = clientHeight;
        },
      });
      instance.viewWrapper.current.clientWidth = 500;
      instance.viewWrapper.current.clientHeight = 500;
      instance.setState({
        viewTransform: {
          k: 0.4,
          x: 50,
          y: 50,
        },
      });
      instance.entities = document.createElement('g');
      instance.entities.appendChild(entity);
    });

    it('modifies the zoom to pan to the element', () => {
      instance.panToEntity(entity, false);
      expect(entity.getBBox).toHaveBeenCalled();
      expect(instance.setZoom).toHaveBeenCalledWith(0.4, 168, 186, 750);
    });

    it('modifies the zoom to pan and zoom to the element', () => {
      instance.panToEntity(entity, true);
      expect(entity.getBBox).toHaveBeenCalled();
      expect(instance.setZoom).toHaveBeenCalledWith(1.125, 19.375, 70, 750);
    });
  });

  describe('panToNode method', () => {
    const entity = document.createElement('g');

    entity.id = 'node-a1-container';

    beforeEach(() => {
      instance.panToEntity = jest.fn();

      instance.entities = document.createElement('g');
      instance.entities.appendChild(entity);
    });

    it('calls panToEntity on the appropriate node', () => {
      instance.panToNode('a1');
      expect(instance.panToEntity).toHaveBeenCalledWith(entity, false);
    });
  });

  describe('panToEdge method', () => {
    const entity = document.createElement('g');

    entity.id = 'edge-a1-a2-container';

    beforeEach(() => {
      instance.panToEntity = jest.fn();

      instance.entities = document.createElement('g');
      instance.entities.appendChild(entity);
    });

    it('calls panToEntity on the appropriate edge', () => {
      instance.panToEdge('a1', 'a2');
      expect(instance.panToEntity).toHaveBeenCalledWith(entity, false);
    });
  });

  describe('handleKeyDown', () => {
    it('ignores keydown when not focused', () => {
      output.setState({ focused: false });
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'z',
          char: 'z',
          keyCode: 90,
          metaKey: true,
        })
      );
      expect(onUndo).not.toHaveBeenCalled();
    });

    it('handles keydown when focused', () => {
      output.setState({ focused: true });
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'z',
          char: 'z',
          keyCode: 90,
          metaKey: true,
        })
      );
      expect(onUndo).toHaveBeenCalled();
    });
  });

  describe('handleDocumentClick', () => {
    it('removes focus when clicking outside svg', () => {
      output.setState({ focused: true });
      document.documentElement.dispatchEvent(new MouseEvent('mousedown'));
      expect(instance.state.focused).toBe(false);
    });

    it('keeps focus when clicking inside svg', () => {
      output.setState({ focused: true });
      instance.graphSvg = {
        current: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      };
      const child = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      instance.graphSvg.current.appendChild(child);

      child.dispatchEvent(new MouseEvent('mousedown'));
      expect(instance.state.focused).toBe(true);
    });
  });

  describe('handleMultipleSelected method', () => {
    beforeEach(() => {
      output.setProps({
        edges: [
          { source: 'a', target: 'b' },
          { source: 'b', target: 'c' },
        ],
        nodes: [{ id: 'a', x: 1, y: 1 }, { id: 'b', x: 2, y: 2 }, { id: 'c' }],
        nodeKey: 'id',
      });
    });

    it('onSelect', () => {
      const selectionStart = { x: 1, y: 1 };
      const selectionEnd = { x: 100, y: 100 };

      let actual = null;

      output.setProps({
        onSelect: selected => {
          actual = selected;
        },
      });
      instance.handleMultipleSelected(selectionStart, selectionEnd);
      expect(actual.nodes.size).toEqual(2);
      expect(actual.edges.size).toEqual(1);
    });
  });
});

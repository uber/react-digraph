# react-digraph
![Demo](example.gif?raw=true)
## Overview

A React component which makes it easy to create a directed graph editor without implementing any of the SVG drawing or event handling logic.

## Important v8.0.0 Information
Version 8.0.0 introduces multi-select nodes and edges using Ctrl-Shift-Mouse events (Cmd-Shift-mouse for Mac). This requires a breaking change. Instead of onSelectNode/Edge, you'll only provide one onSelect function callback and a `selected` object with `{ nodes: Map, and edges: Map }` as the parameter format. The [typings folder](typings/index.d.ts) has the exact type definition for these attributes. When either edges or nodes are selected the onSelect function will fire with the object. You will have to handle all nodes and edges selected, or if there is only one then you will have to determine if it's a node or edge within the onSelect function.

To disable multi-select you can set `allowMultiselect` to `false`, which disables the Ctrl-Shift-mouse event, but we will still use the `onSelect` function. Both `onSelectNode` and `onSelectEdge` are deprecated.

Breaking changes:

- `onPasteSelected` now accepts a `SelectionT` object for the first parameter
- `onPasteSelected` now accepts an `IPoint` instead
of a `XYCoords` array for the second parameter.
- `onDeleteSelected` is added which takes a `SelectionT` parameter.
- `onSelect` is added, which accepts `SelectionT` and `Event` parameters.
- `onUpdateNode` accepts a Map of updated nodes in the second parameter (for example, if multiple nodes are moved).
- `selected` is a new property to track selected nodes and edges. It is a `SelectionT` type.
- `canDeleteSelected` takes the place of `canDeleteNode` and `canDeleteEdge`. It accepts a `SelectionT` type as a parameter.
- `onDeleteNode` is removed
- `onDeleteEdge` is removed
- `selectedNode` is removed
- `selectedEdge` is removed
- `canDeleteNode` is removed
- `canDeleteEdge` is removed
- `selectedNodes` is removed
- `selectedEdges` is removed

## Installation

```bash
npm install --save react-digraph
```

If you don't have the following peerDependenies, make sure to install them:

```bash
npm install --save react react-dom
```

## Usage


The default export is a component called `GraphView`; it provides a multitude of hooks for various graph editing operations and a set of controls for zooming. Typically, it should be wrapped in a higher order component that supplies various callbacks (`onCreateNode`, `onCreateEdge` etc...).

`GraphView` expects several properties to exist on your nodes and edges. If these types conflict with existing properties on your data, you must transform your data to re-key these properties under different names and to add the expected properties. All nodes and edges can have a `type` attribute set - nodes also support a `subtype` attribute. For a full description of node and edge properties, see the sections for `INode` and `IEdge` below.

Configuration for nodes and edges can be passed to `GraphView` via the `nodeTypes`, `nodeSubtypes`, and `edgeTypes` props. Custom SVG elements can be defined here for the node's type/subtype and the edge's type.

It is often convenient to combine these types into a configuration object that can be referred to elsewhere in the application and used to associate events fired from nodes/edges in the `GraphView` with other actions in the application. Here is an abbreviated example:

```jsx
import {
  GraphView, // required
  Edge, // optional
  type IEdge, // optional
  Node, // optional
  type INode, // optional
  type LayoutEngineType, // required to change the layoutEngineType, otherwise optional
  BwdlTransformer, // optional, Example JSON transformer
  GraphUtils // optional, useful utility functions
} from 'react-digraph';

const GraphConfig =  {
  NodeTypes: {
    empty: { // required to show empty nodes
      typeText: "None",
      shapeId: "#empty", // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 100" id="empty" key="0">
          <circle cx="50" cy="50" r="45"></circle>
        </symbol>
      )
    },
    custom: { // required to show empty nodes
      typeText: "Custom",
      shapeId: "#custom", // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 50 25" id="custom" key="0">
          <ellipse cx="50" cy="25" rx="50" ry="25"></ellipse>
        </symbol>
      )
    }
  },
  NodeSubtypes: {},
  EdgeTypes: {
    emptyEdge: {  // required to show empty edges
      shapeId: "#emptyEdge",
      shape: (
        <symbol viewBox="0 0 50 50" id="emptyEdge" key="0">
          <circle cx="25" cy="25" r="8" fill="currentColor"> </circle>
        </symbol>
      )
    }
  }
}

const NODE_KEY = "id"       // Allows D3 to correctly update DOM

class Graph extends Component {

  constructor(props) {
    super(props);

    this.state = {
      graph: sample,
      selected: {}
    }
  }

  /* Define custom graph editing methods here */

  render() {
    const nodes = this.state.graph.nodes;
    const edges = this.state.graph.edges;
    const selected = this.state.selected;

    const NodeTypes = GraphConfig.NodeTypes;
    const NodeSubtypes = GraphConfig.NodeSubtypes;
    const EdgeTypes = GraphConfig.EdgeTypes;

    return (
      <div id='graph' style={styles.graph}>

        <GraphView  ref='GraphView'
                    nodeKey={NODE_KEY}
                    nodes={nodes}
                    edges={edges}
                    selected={selected}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    allowMultiselect={true} // true by default, set to false to disable multi select.
                    onSelect={this.onSelect}
                    onCreateNode={this.onCreateNode}
                    onUpdateNode={this.onUpdateNode}
                    onDeleteNode={this.onDeleteNode}
                    onCreateEdge={this.onCreateEdge}
                    onSwapEdge={this.onSwapEdge}
                    onDeleteEdge={this.onDeleteEdge}/>
      </div>
    );
  }

}
```

A typical graph that would be stored in the Graph component's state looks something like this:

```json
{
  "nodes": [
    {
      "id": 1,
      "title": "Node A",
      "x": 258.3976135253906,
      "y": 331.9783248901367,
      "type": "empty"
    },
    {
      "id": 2,
      "title": "Node B",
      "x": 593.9393920898438,
      "y": 260.6060791015625,
      "type": "empty"
    },
    {
      "id": 3,
      "title": "Node C",
      "x": 237.5757598876953,
      "y": 61.81818389892578,
      "type": "custom"
    },
    {
      "id": 4,
      "title": "Node C",
      "x": 600.5757598876953,
      "y": 600.81818389892578,
      "type": "custom"
    }
  ],
  "edges": [
    {
      "source": 1,
      "target": 2,
      "type": "emptyEdge"
    },
    {
      "source": 2,
      "target": 4,
      "type": "emptyEdge"
    }
  ]
}

```

For a detailed example, check out src/examples/graph.js.
To run the example:

```bash
npm install
npm run example
```

A webpage will open in your default browser automatically.

- To add nodes, hold shift and click on the grid.
- To add edges, hold shift and click/drag to between nodes.
- To delete a node or edge, click on it and press delete.
- Click and drag nodes to change their position.
- To select multiple nodes, press Ctrl+Shift then click and drag the mouse.
- You may copy and paste selected nodes and edges with Ctrl+C and Ctrl+V

* Note: On Mac computers, use Cmd instead of Ctrl.

All props are detailed below.


## Props

| Prop                       | Type                       | Required     | Notes                                                                                                                                                                                       |
| ----------------------     | :------------------------: | :----------: | :----------------------------------------------------------:                                                                                                                                |
| `nodeKey`                  | `string`                   | `true`       | Key for D3 to update nodes(typ. UUID).                                                                                                                                                      |
| `nodes`                    | `Array<INode>`             | `true`       | Array of graph nodes.                                                                                                                                                                       |
| `edges`                    | `Array<IEdge>`             | `true`       | Array of graph edges.                                                                                                                                                                       |
| `allowCopyEdges`           | `boolean`                  | `false`      | (default false) Allow `onCopySelected` to be called when an edge is selected without any nodes. |
| `allowMultiselect`         | `boolean`                  | `false`      | (default true) Use Ctrl-Shift-LeftMouse to draw a multiple selection box. |
| `selected`                 | `object`                   | `true`       | The currently selected graph entity. |
| `nodeTypes`                | `object`                   | `true`       | Config object of available node types.                                                                                                                                                      |
| `nodeSubtypes`             | `object`                   | `true`       | Config object of available node subtypes.                                                                                                                                                   |
| `edgeTypes`                | `object`                   | `true`       | Config object of available edge types.                                                                                                                                                      |
| `onSelect`             | `func`                     | `false`       | Called when nodes are selected when `allowMultiselect` is true. Is passed an object with nodes and edges included. |
| `onCreateNode`             | `func`                     | `true`       | Called when a node is created.                                                                                                                                                              |
| `onContextMenu`            | `func`                     | `true`       | Called when contextmenu event triggered.                                                                                                                                                              |
| `onUpdateNode`             | `func`                     | `true`       | Called when a node is moved.|
| `onCreateEdge`             | `func`                     | `true`       | Called when an edge is created.|
| `onSwapEdge`               | `func`                     | `true`       | Called when an edge `'target'` is swapped.|
| `onBackgroundClick`        | `func`                     | `false`      | Called when the background is clicked.  |
| `onArrowClicked`        | `func`                     | `false`      | Called when the arrow head is clicked. |
| `onUndo`                | `func` | `false` | A function called when Ctrl-Z is activated. React-digraph does not keep track of actions, this must be implemented in the client website. |
| `onCopySelected` | `func` | `false` | A function called when Ctrl-C is activated. React-digraph does not keep track of copied nodes or edges, the this must be implemented in the client website. |
| `onPasteSelected` | `func` | `false` | A function called when Ctrl-V is activated. React-digraph does not keep track of copied nodes or edges, the this must be implemented in the client website.
| `canDeleteSelected` | `func` | `false` | takes the place of `canDeleteNode` and `canDeleteEdge`. It accepts a `SelectionT` type as a parameter. It is called before a node or edge is deleted. The function should return a boolean.
| `canCreateEdge`            | `func`                     | `false`      | Called before an edge is created.|
| `canSwapEdge`              | `func`                     | `false`      | Called before an edge 'target' is swapped.
| `afterRenderEdge`          | `func`                     | `false`      | Called after an edge is rendered.                                                                                                                                                           |
| `renderNode`               | `func`                     | `false`      | Called to render node geometry.                                                                                                                                                             |
| `renderNodeText`           | `func`                     | `false`      | Called to render the node text                                                                                                                                                              |
| `renderDefs`               | `func`                     | `false`      | Called to render SVG definitions.                                                                                                                                                           |
| `renderBackground`         | `func`                     | `false`      | Called to render SVG background.                                                                                                                                                            |
| `readOnly`                 | `bool`                     | `false`      | Disables all graph editing interactions.                                                                                                                                                    |
| `disableBackspace`         | `bool`                     | `false`      | Disables using backspace to delete the selected node.                                                                                                                                            |
| `maxTitleChars`            | `number`                   | `false`      | Truncates node title characters.                                                                                                                                                            |
| `gridSize`                 | `number`                   | `false`      | Overall grid size.                                                                                                                                                                          |
| `gridSpacing`              | `number`                   | `false`      | Grid spacing.                                                                                                                                                                               |
| `gridDotSize`              | `number`                   | `false`      | Grid dot size.                                                                                                                                                                              |
| `minZoom`                  | `number`                   | `false`      | Minimum zoom percentage.                                                                                                                                                                    |
| `maxZoom`                  | `number`                   | `false`      | Maximum zoom percentage.                                                                                                                                                                    |
| `nodeSize`                 | `number`                   | `false`      | Node bbox size.                                                                                                                                                                             |
| `edgeHandleSize`           | `number`                   | `false`      | Edge handle size.                                                                                                                                                                           |
| `edgeArrowSize`            | `number`                   | `false`      | Edge arrow size in pixels. Default 8. Set to 0 to hide arrow.                                                                                                                                                                           |
| `zoomDelay`                | `number`                   | `false`      | Delay before zoom occurs.                                                                                                                                                                   |
| `zoomDur`                  | `number`                   | `false`      | Duration of zoom transition.                                                                                                                                                                |
| `showGraphControls`        | `boolean`                  | `false`      | Whether to show zoom controls. |
| `layoutEngineType`         | `typeof LayoutEngineType`  | `false`      | Uses a pre-programmed layout engine, such as `'SnapToGrid'`                                                                                                                                 |
| `rotateEdgeHandle`         | `boolean`                  | `false`      | Whether to rotate edge handle with edge when a node is moved                                                                                                                                |
| `centerNodeOnMove`         | `boolean`                  | `false`      | Whether the node should be centered on cursor when moving a node                                                                                                                            |
| `initialBBox`              | `typeof IBBox`             | `false`      | If specified, initial render graph using the given bounding box                                                                                                                             |
| `graphConfig`              | `object`                   | `false`      | [dagre](https://github.com/dagrejs/dagre/wiki#configuring-the-layout) graph setting configuration, which will override layout engine graph configuration - only apply to `'HorizontalTree'` |
| `nodeSizeOverridesAllowed` | `boolean`                  | `false`      | Flag to toggle `sizeOverride` in `nodes` - only apply to `'HorizontalTree'`                                                                                                                 |
| `nodeLocationOverrides`    | `object`                   | `false`      | Nodes location overrides object - only apply to `'HorizontalTree'`                                                                                                                          |

### `onCreateNode`
You have access to `d3` mouse event in `onCreateNode` function.
```javascript
  onCreateNode = (x, y, mouseEvent) => {
    // we can get the exact mouse position when click happens with this line
    const {pageX, pageY} = mouseEvent;
    // rest of the code for adding a new node ...
  };
```


## Prop Types:

See prop types in the [typings folder](typings/index.d.ts).


### `INode`

| Prop                   | Type                       | Required     | Notes                                             |
| ---------------------- | :------------------------: | :----------: | :-----------------------------------------------: |
| `anyIDKey`             | `string`                   | `true`       | An id or key for nodes, same as the nodeKey prop  |
| `title`                | `string`                   | `true`       | Used in edges and to render the node text.        |
| `x`                    | `number`                   | `false`      | X coordinate of the node.                         |
| `y`                    | `number`                   | `false`      | Y coordinate of the node.                         |
| `type`                 | `string`                   | `false`      | Node type, for displaying a custom SVG shape.     |
| `subtype`              | `string`                   | `false`      | Node subtype, for displaying a custom SVG shape.  |


#### `title`

The `title` attribute is used for the IDs in the SVG nodes in the graph.

### `IEdge`

| Prop                   | Type                       | Required     | Notes                                             |
| ---------------------- | :------------------------: | :----------: | :-----------------------------------------------: |
| `source`               | `string`                   | `true`       | The `title` of the parent node.                   |
| `target`               | `string`                   | `true`       | The `title` of the child node.                    |
| `type`                 | `string`                   | `false`      | Edge type, for displaying a custom SVG shape.     |
| `handleText`           | `string`                   | `false`      | Text to render on the edge.                       |
| `handleTooltipText`    | `string`                   | `false`      | Used to render the SVG `title` element.           |
| `label_from`           | `string`                   | `false`      | Text to render along the edge with `label_to`.    |
| `label_to`             | `string`                   | `false`      | Text to render along the edge with `label_from`.  |


## Imperative API
You can call these methods on the GraphView class using a ref.

| Method             | Type                                                        | Notes                                                                                                     |
| ------------------ | :---------------------------------------------------------: | :-------------------------------------------------------------------------:                               |
| `panToNode`        | `(id: string, zoom?: boolean) => void`                      | Center the node given by `id` within the viewport, optionally zoom in to fit it.                          |
| `panToEdge`        | `(source: string, target: string, zoom?: boolean) => void`  | Center the edge between `source` and `target` node IDs within the viewport, optionally zoom in to fit it. |

## Deprecation Notes

| Prop                 | Type      | Required   | Notes                                      |
| -------------------- | :-------: | :--------: | :----------------------------------------: |
| `emptyType`          | `string`  | `true`     | 'Default' node type.                       |
| `getViewNode`        | `func`    | `true`     | Node getter.                               |
| `renderEdge`         | `func`    | `false`    | Called to render edge geometry.            |
| `enableFocus`        | `bool`    | `false`    | Adds a 'focus' toggle state to GraphView.  |
| `transitionTime`     | `number`  | `false`    | Fade-in/Fade-out time.                     |
| `primary`            | `string`  | `false`    | Primary color.                             |
| `light`              | `string`  | `false`    | Light color.                               |
| `dark`               | `string`  | `false`    | Dark color.                                |
| `style`              | `object`  | `false`    | Style prop for wrapper.                    |
| `gridDot`            | `number`  | `false`    | Grid dot size.                             |
| `graphControls`      | `boolean` | `true`     | Whether to show zoom controls.             |

# react-digraph
![Demo](example.gif?raw=true)
## Overview

A React component which makes it easy to create a directed graph editor without implementing any of the SVG drawing or event handling logic.

## Installation

```
npm install --save react-digraph
```

## Usage


The default export is a component called 'GraphView'; it provides a multitude of hooks for various graph editing operations and a set of controls for zooming. Typically, it should be wrapped in a higher order component that supplies various callbacks (onCreateNode, onCreateEdge etc...).

All nodes and edges can have a type attribute set - nodes also support a subtype attribute. These can be passed to GraphView via the nodeTypes, nodeSubtypes, and edgeTypes props. GraphView will look up the corresponding SVG elements for the node's type/subtype and the edge's type and draw it accordingly. 

It is often convenient to combine these types into a configuration object that can be referred to elsewhere in the application and used to associate events fired from nodes/edges in the graphView with other actions in the application. Here is an abbreviated example:

```jsx
import GraphView from 'react-digraph'



const GraphConfig =  {
  NodeTypes: {
    empty: {
      typeText: "None",
      shapeId: "#empty",
      shape: (
        <symbol viewBox="0 0 100 100" id="empty" key="0">
          <circle cx="50" cy="50" r="45"></circle>
        </symbol>
      )
    }
  }, 
  NodeSubtypes: {}, 
  EdgeTypes: {
    emptyEdge: {
      shapeId: "#emptyEdge",
      shape: (
        <symbol viewBox="0 0 50 50" id="emptyEdge" key="0">
          <circle cx="25" cy="25" r="8" fill="currentColor"> </circle>
        </symbol>
      )
    }
  }
}

const EMPTY_TYPE = "empty"  // Text on empty nodes is positioned differently 
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
                    emptyType={EMPTY_TYPE}
                    nodes={nodes}
                    edges={edges}
                    selected={selected}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    getViewNode={this.getViewNode}
                    onSelectNode={this.onSelectNode}
                    onCreateNode={this.onCreateNode}
                    onUpdateNode={this.onUpdateNode}
                    onDeleteNode={this.onDeleteNode}
                    onSelectEdge={this.onSelectEdge}
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
      "type": "empty"
    },
    {
      "id": 4,
      "title": "Node C",
      "x": 600.5757598876953,
      "y": 600.81818389892578,
      "type": "empty"
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
```
npm install
npm run example 
```
go to localhost:8000.

- To add nodes, hold shift and click on the grid.
- To add edges, hold shift and click/drag to between nodes.
- To delete a node or edge, click on it and press delete.
- Click and drag nodes to change their position.

All props are detailed below.


## Props

| Prop          | Type    | Required  | Notes                                     |
| ------------- |:-------:| :--------:| :----------------------------------------:|
| primary       | string  | false     | Primary color.                            |
| light         | string  | false     | Light color.                              |
| dark          | string  | false     | Dark color.                               |
| style         | object  | false     | Style prop for wrapper.                   |
| nodeKey       | string  | true      | Key for D3 to update nodes(typ. UUID).    |
| emptyType     | string  | true      | 'Default' node type.                      |
| nodes         | array   | true      | Array of graph nodes.                     |
| edges         | array   | true      | Array of graph edges.                     |
| readOnly      | bool    | false     | Disables all graph editing interactions.  |
| enableFocus   | bool    | false     | Adds a 'focus' toggle state to GraphView. |
| selected      | object  | true      | The currently selected graph entity.      |
| nodeTypes     | object  | true      | Config object of available node types.    |
| nodeSubtypes  | object  | true      | Config object of available node subtypes. |
| edgeTypes     | object  | true      | Config object of available edge types.    |
| getViewNode   | func    | true      | Node getter.                              |
| onSelectNode  | func    | true      | Called when a node is selected.           |
| onCreateNode  | func    | true      | Called when a node is created.            |
| onUpdateNode  | func    | true      | Called when a node is moved.              |
| canDeleteNode | func    | false     | Called before a node is deleted.          |
| onDeleteNode  | func    | true      | Called when a node is deleted.            |
| onSelectEdge  | func    | true      | Called when an edge is selected.          |
| canCreateEdge | func    | false     | Called before an edge is created.         |
| onCreateEdge  | func    | true      | Called when an edge is created.           |
| onSwapEdge    | func    | true      | Called when an edge 'target' is swapped.  |
| canDeleteEdge | func    | false     | Called before an edge is deleted.         |
| onDeleteEdge  | func    | true      | Called when an edge is deleted.           |

## Notes

- To run the tests, you'll need to be using at least node v4.0 (for jsDom).

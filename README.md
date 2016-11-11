# react-digraph

## Overview

A React component which makes it easy to create a directed graph editor without implementing any of the SVG drawing or event handling logic.

## Installation

```
npm install --save react-digraph
```

## Usage

Import the GraphView component.  

```
import GraphView from '../components/graph-view.js'
```
This provides a multitude of hooks for various graph editing operations and a set of controls for zooming. Typically, it should be wrapped in a higher order component that supplies various callbacks (onCreateNode, onCreateEdge etc...).

All nodes and edges can have a type attribute set - nodes also support a subtype attribute. These can be passed to GraphView via the nodeTypes, nodeSubtypes, and edgeTypes props. GraphView will look up the corresponding SVG elements for the node's type/subtype and the edge's type and draw it accordingly. 

GraphView is agnostic about how these types are assigned/used in your application. It is often convenient to combine them into a configuration object that can be referred to elsewhere in the application and used to associate events fired from nodes/edges in the graphView with other actions in the application.

For a detailed example, check out src/examples/graph.js, to see it in action. All other props are detailed below.
```
npm install
npm run example 
```
go to localhost:8000.

- To add nodes, hold shift and click on the grid.
- To add edges, hold shift and click/drag to between nodes.
- To delete a node or edge, click on it and press delete.
- Click and drag nodes to change their position.


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
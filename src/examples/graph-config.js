// @flow

/*
  Example config for GraphView component
*/
import * as React from 'react';

export const NODE_KEY = 'id'; // Key used to identify nodes

// These keys are arbitrary (but must match the config)
// However, GraphView renders text differently for empty types
// so this has to be passed in if that behavior is desired.
export const EMPTY_TYPE = 'customEmpty'; // Empty node type
export const POLY_TYPE = 'poly';
export const SPECIAL_TYPE = 'special';
export const SKINNY_TYPE = 'skinny';
export const SPECIAL_CHILD_SUBTYPE = 'specialChild';
export const EMPTY_EDGE_TYPE = 'emptyEdge';
export const SPECIAL_EDGE_TYPE = 'specialEdge';
export const COMPLEX_CIRCLE_TYPE = 'complexCircle';
export const COMPUTER_TYPE = 'computer';
export const FILE_TYPE = 'file';

export const nodeTypes = [
  EMPTY_TYPE,
  POLY_TYPE,
  SPECIAL_TYPE,
  SKINNY_TYPE,
  COMPUTER_TYPE,
  FILE_TYPE,
];
export const edgeTypes = [EMPTY_EDGE_TYPE, SPECIAL_EDGE_TYPE];

const EmptyNodeShape = (
  <symbol viewBox="0 0 154 154" width="154" height="154" id="emptyNode">
    <circle cx="77" cy="77" r="76" />
  </symbol>
);

const CustomEmptyShape = (
  <symbol viewBox="0 0 100 100" id="customEmpty">
    <circle cx="50" cy="50" r="45" />
  </symbol>
);

const SpecialShape = (
  <symbol viewBox="-27 0 154 154" id="special" width="154" height="154">
    <rect transform="translate(50) rotate(45)" width="109" height="109" />
  </symbol>
);

const PolyShape = (
  <symbol viewBox="0 0 88 72" id="poly" width="88" height="88">
    <path d="M 0 36 18 0 70 0 88 36 70 72 18 72Z" />
  </symbol>
);

const ComplexCircleShape = (
  <symbol viewBox="0 0 100 100" id="complexCircle" width="100" height="100">
    <circle cx="50" cy="50" r="50" fill="transparent" stroke="transparent" />
    <circle cx="50" cy="50" r="34" />
    <path
      d="M50,0a50,50,0,1,0,50,50A50,50,0,0,0,50,0Zm0,90A40,40,0,1,1,90,50,40,40,0,0,1,50,90Z"
      data-intersect-ignore="true"
    />
  </symbol>
);

const SkinnyShape = (
  <symbol viewBox="0 0 154 54" width="154" height="54" id="skinny">
    <rect x="0" y="0" rx="2" ry="2" width="154" height="54" />
  </symbol>
);

const ComputerShape = (
  <symbol viewBox="-0.5 26 196 143" id="computer" width="196" height="143">
    <rect
      x="-0.5"
      y="26"
      rx="5"
      ry="5"
      width="196"
      height="143"
      fill="transparent"
      stroke="transparent"
    />
    <path d="M183.198 65.7554 146.185 65.7554 146.185 60.0388 183.198 60.0388 183.198 65.7554ZM183.198 69.4834 146.185 69.4834 146.185 75.2114 183.198 75.2114 183.198 69.4834ZM183.176 43.5518 146.219 43.5518 146.219 56.1465 183.176 56.1465 183.176 43.5518ZM195 30.0109 195 165.006C194.994 167.029 193.346 168.677 191.317 168.677L138.077 168.677C136.043 168.677 134.4 167.029 134.4 165L134.4 30.0109C134.4 27.9826 136.043 26.3282 138.077 26.3282L191.317 26.3282C193.351 26.3282 195 27.9826 195 30.0109ZM187.64 33.6766 141.749 33.6766 141.749 161.323 187.64 161.323 187.64 33.6766ZM183.198 78.9337 146.185 78.9337 146.185 84.6447 183.198 84.6447 183.198 78.9337ZM177.176 121.528C177.176 128.111 171.856 133.42 165.295 133.42 158.723 133.42 153.403 128.106 153.403 121.528 153.403 114.967 158.729 109.641 165.295 109.641 171.856 109.641 177.176 114.973 177.176 121.528ZM172.887 121.528C172.887 117.341 169.488 113.93 165.289 113.93 161.085 113.93 157.686 117.335 157.686 121.528 157.686 125.721 161.085 129.12 165.289 129.12 169.488 129.12 172.887 125.721 172.887 121.528ZM124.287 52.2259 124.287 128.74C124.287 133.352 120.576 137.086 116.01 137.086L74.6731 137.086C74.6731 137.086 72.3276 153.788 87.2055 153.788L87.2055 162.145 74.6731 162.145 49.6197 162.145 37.0873 162.145 37.0873 153.799C51.4157 153.799 49.6197 137.097 49.6197 137.097L8.30016 137.097C3.71666 137.097 0 133.363 0 128.752L0 52.2259C0 47.614 3.71666 43.8974 8.30016 43.8974L116.004 43.8974C120.576 43.8974 124.287 47.614 124.287 52.2259ZM69.8687 126.876C69.8687 122.922 66.6619 119.721 62.7073 119.721 58.747 119.721 55.5346 122.922 55.5346 126.876 55.5346 130.831 58.7414 134.043 62.7073 134.043 66.6676 134.043 69.8687 130.831 69.8687 126.876ZM115.415 52.7528 8.88372 52.7528 8.88372 117.267 115.409 117.267 115.415 117.267C115.415 117.267 115.415 52.7528 115.415 52.7528ZM62.781 122.395C60.3221 122.395 58.3334 124.389 58.3334 126.842 58.3334 129.296 60.3277 131.29 62.781 131.29 65.2342 131.29 67.2285 129.296 67.2285 126.842 67.2285 124.389 65.2398 122.395 62.781 122.395Z" />
  </symbol>
);

const FileShape = (
  <symbol viewBox="15 -0.49 102.8 133.6" id="file" width="102.8" height="133.6">
    <rect
      x="15"
      y="-0.49"
      width="102.8"
      height="133.6"
      fill="transparent"
      stroke="transparent"
    />
    <path d="M86.4935 0 15.4074 0 15.4074 133 117.593 133 117.593 31.3275 86.4935 0ZM88.073 9.27438 108.386 29.7361 88.073 29.7361 88.073 9.27438ZM20.8204 127.587 20.8204 5.41306 82.66 5.41306 82.66 35.1492 112.18 35.1492 112.18 127.587 20.8204 127.587 20.8204 127.587Z" />
    <path d="M31.1919 29.7361 75.173 29.7361 75.173 35.1492 31.1919 35.1492Z" />
    <path d="M31.1919 54.5355 101.809 54.5355 101.809 59.9486 31.1919 59.9486Z" />
    <path d="M31.1919 79.3349 101.809 79.3349 101.809 84.748 31.1919 84.748Z" />
    <path d="M31.1919 104.134 101.809 104.134 101.809 109.547 31.1919 109.547Z" />
  </symbol>
);

const SpecialChildShape = (
  <symbol viewBox="0 0 154 154" id="specialChild">
    <rect
      x="2.5"
      y="0"
      width="154"
      height="154"
      fill="rgba(30, 144, 255, 0.12)"
    />
  </symbol>
);

const EmptyEdgeShape = (
  <symbol viewBox="0 0 50 50" id="emptyEdge">
    <circle cx="25" cy="25" r="8" fill="currentColor" />
  </symbol>
);

const SpecialEdgeShape = (
  <symbol viewBox="0 0 50 50" id="specialEdge">
    <rect
      transform="rotate(45)"
      x="27.5"
      y="-7.5"
      width="15"
      height="15"
      fill="currentColor"
    />
  </symbol>
);

export default {
  EdgeTypes: {
    emptyEdge: {
      shape: EmptyEdgeShape,
      shapeId: '#emptyEdge',
    },
    specialEdge: {
      shape: SpecialEdgeShape,
      shapeId: '#specialEdge',
    },
  },
  NodeSubtypes: {
    specialChild: {
      shape: SpecialChildShape,
      shapeId: '#specialChild',
    },
  },
  NodeTypes: {
    emptyNode: {
      shape: EmptyNodeShape,
      shapeId: '#emptyNode',
      typeText: 'None',
    },
    empty: {
      shape: CustomEmptyShape,
      shapeId: '#empty',
      typeText: 'None',
    },
    special: {
      shape: SpecialShape,
      shapeId: '#special',
      typeText: 'Special',
    },
    skinny: {
      shape: SkinnyShape,
      shapeId: '#skinny',
      typeText: 'Skinny',
    },
    computer: {
      shape: ComputerShape,
      shapeId: '#computer',
      // typeText: 'Computer',
    },
    file: {
      shape: FileShape,
      shapeId: '#file',
      // typeText: 'File',
    },
    poly: {
      shape: PolyShape,
      shapeId: '#poly',
      typeText: 'Poly',
    },
    complexCircle: {
      shape: ComplexCircleShape,
      shapeId: '#complexCircle',
      typeText: 'complexCircle',
    },
  },
};

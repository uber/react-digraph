// @flow
import React from 'react';
import { type IEdge } from './edge';

type EdgeLabelTextProps = {
  data: IEdge,
  edgeHandleRotation: [string, boolean],
  edgeHandleTranslation: string,
};

export function EdgeLabelText({
  data,
  edgeHandleRotation,
  edgeHandleTranslation,
}: EdgeLabelTextProps) {
  const [rotation, isRotated] = edgeHandleRotation;
  const title = isRotated
    ? `${data.label_to || ''}${data.label_from ? ` ↔ ${data.label_from}` : ''}`
    : `${data.label_from || ''}${data.label_to ? ` ↔ ${data.label_to}` : ''}`;

  return (
    <text
      className="edge-text edge-label-text"
      textAnchor="middle"
      alignmentBaseline="central"
      transform={`${edgeHandleTranslation} ${rotation} translate(0,-5)`}
    >
      {title}
    </text>
  );
}

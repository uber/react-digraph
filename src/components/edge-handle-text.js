// @flow

import React from 'react';

type EdgeHandleTextProps = {
  handleText: string,
  edgeHandleTranslation: string,
};

export function EdgeHandleText({
  handleText,
  edgeHandleTranslation,
}: EdgeHandleTextProps) {
  return (
    <text
      className="edge-text edge-handle-text"
      textAnchor="middle"
      alignmentBaseline="central"
      dominantBaseline="middle"
      transform={`${edgeHandleTranslation}`}
    >
      {handleText}
    </text>
  );
}

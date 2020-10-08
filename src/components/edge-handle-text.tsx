// @flow

import React from 'react';

type EdgeHandleTextProps = {
  handleText: string;
  edgeHandleTranslation: string;
};

export function EdgeHandleText({
  handleText,
  edgeHandleTranslation,
}: EdgeHandleTextProps) {
  return (
    <text
      className="edge-text"
      textAnchor="middle"
      alignmentBaseline="central"
      transform={`${edgeHandleTranslation}`}
    >
      {handleText}
    </text>
  );
}

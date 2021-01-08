import React from 'react';

export default React.forwardRef(function HighlightArea(props, ref) {
  const { startPoint, endPoint } = props;
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;

  return (
    <rect
      className="highlight-area"
      width={Math.abs(width)}
      height={Math.abs(height)}
      ref={ref}
      x={width > 0 ? startPoint.x : endPoint.x}
      y={height > 0 ? startPoint.y : endPoint.y}
      style={{
        fill: 'rgb(0, 149, 210)',
        fillOpacity: 0.15,
        stroke: 'rgba(57, 165, 209, 0.5)',
        strokeWidth: 2,
      }}
    ></rect>
  );
});

// @flow
import { intersect, shape } from 'svg-intersections';
import { Point2D, Matrix2D } from 'kld-affine';
import { Intersection } from 'kld-intersections';
import { getDefaultIntersectResponse, getArrowSize } from './edge-helpers';

export function getRotatedRectIntersect(
  defSvgRotatedRectElement: any,
  src: any,
  trg: any,
  includesArrow: boolean,
  viewWrapperElem: HTMLDivElement
) {
  const response = getDefaultIntersectResponse();
  const arrowSize = getArrowSize(viewWrapperElem);
  const clientRect = defSvgRotatedRectElement.getBoundingClientRect();

  const widthAttr = defSvgRotatedRectElement.getAttribute('width');
  const heightAttr = defSvgRotatedRectElement.getAttribute('height');
  const w = widthAttr ? parseFloat(widthAttr) : clientRect.width;
  const h = heightAttr ? parseFloat(heightAttr) : clientRect.height;
  const trgX = trg.x || 0;
  const trgY = trg.y || 0;
  const srcX = src.x || 0;
  const srcY = src.y || 0;

  const top = trgY - h / 2;
  const bottom = trgY + h / 2;
  const left = trgX - w / 2;
  const right = trgX + w / 2;

  const line = shape('line', { x1: srcX, y1: srcY, x2: trgX, y2: trgY });

  // define rectangle
  const rect = {
    topLeft: new Point2D(left, top),
    bottomRight: new Point2D(right, bottom),
  };

  // convert rectangle corners to polygon (list of points)
  const poly = [
    rect.topLeft,
    new Point2D(rect.bottomRight.x, rect.topLeft.y),
    rect.bottomRight,
    new Point2D(rect.topLeft.x, rect.bottomRight.y),
  ];

  // find center point of rectangle
  const center = rect.topLeft.lerp(rect.bottomRight, 0.5);

  // get the rotation
  const transform = defSvgRotatedRectElement.getAttribute('transform');
  let rotate = transform
    ? transform.replace(/(rotate.[0-9]*.)|[^]/g, '$1')
    : null;
  let angle = 0;

  if (rotate) {
    // get the number
    rotate = rotate.replace(/^rotate\(|\)$/g, '');
    // define rotation in radians
    angle = (parseFloat(rotate) * Math.PI) / 180.0;
  }

  // create matrix for rotating around center of rectangle
  const rotation = Matrix2D.rotationAt(angle, center);
  // create new rotated polygon
  const rotatedPoly = poly.map(p => p.transform(rotation));

  // find intersections
  const pathIntersect = Intersection.intersectLinePolygon(
    line.params[0],
    line.params[1],
    rotatedPoly
  );

  if (pathIntersect.points.length > 0) {
    let arrowWidth = 0; //arrowSize.width;
    let arrowHeight = 0; //arrowSize.height;
    const xIntersect = pathIntersect.points[0].x;
    const yIntersect = pathIntersect.points[0].y;

    if (xIntersect > left && xIntersect < right && yIntersect > trgY) {
      // arrow points to the bottom of the node
      arrowHeight = arrowSize.height;
    } else if (xIntersect > left && xIntersect < right && yIntersect < trgY) {
      // arrow points to the top of the node
      arrowHeight = -arrowSize.height;
    } else if (yIntersect > top && yIntersect < bottom && xIntersect < trgX) {
      // arrow points to the left of the node
      arrowWidth = -arrowSize.width;
    } else {
      // arrow points to the right of the node
      arrowWidth = arrowSize.width;
    }

    response.xOff = trgX - xIntersect - (includesArrow ? arrowWidth / 1.25 : 0);
    response.yOff =
      trgY - yIntersect - (includesArrow ? arrowHeight / 1.25 : 0);
    response.intersect = pathIntersect.points[0];
  }

  return response;
}

export function getPathIntersect(
  defSvgPathElement: any,
  src?: any,
  trg?: any,
  includesArrow?: boolean = true,
  viewWrapperElem: HTMLDivElement
) {
  const response = getDefaultIntersectResponse();
  const arrowSize = getArrowSize(viewWrapperElem);
  // get the rectangular area around path
  const clientRect = defSvgPathElement.getBoundingClientRect();
  // getBoundingClientRect doesn't work on Firefox.
  // We do have the width and height on the parent <symbol> element for the node,
  // so we'll use that.
  const w =
    clientRect.width || defSvgPathElement.parentElement.getAttribute('width');
  const h =
    clientRect.height || defSvgPathElement.parentElement.getAttribute('height');
  const trgX = trg?.x || 0;
  const trgY = trg?.y || 0;
  const srcX = src?.x || 0;
  const srcY = src?.y || 0;

  // calculate the positions of each corner relative to the trg position
  const top = trgY - h / 2;
  const bottom = trgY + h / 2;
  const left = trgX - w / 2;
  const right = trgX + w / 2;

  // modify the d property to add top and left to the x and y positions
  let d = defSvgPathElement.getAttribute('d');

  if (!/^M/.test(d)) {
    // doesn't look like what we expect.
    // TODO: add more use cases than simple moveTo commands
    return;
  }

  d = d.replace(/^M /, '');
  let dArr = d.split(/[ ,]+/);

  dArr = dArr.map((val, index) => {
    let isEnd = false;

    if (/Z$/.test(val)) {
      val = val.replace(/Z$/, '');
      isEnd = true;
    }

    // index % 2 are x positions
    if (index % 2 === 0) {
      return parseFloat(val) + left + (isEnd ? 'Z' : '');
    }

    return parseFloat(val) + top + (isEnd ? 'Z' : '');
  });

  const pathIntersect = intersect(
    shape('path', { d: 'M ' + dArr.join(' ') }),
    shape('line', { x1: srcX, y1: srcY, x2: trgX, y2: trgY })
  );

  if (pathIntersect.points.length > 0) {
    let arrowWidth = 0; //arrowSize.width;
    let arrowHeight = 0; //arrowSize.height;
    const xIntersect = pathIntersect.points[0].x;
    const yIntersect = pathIntersect.points[0].y;
    let multiplier = 1;

    if (xIntersect > left && xIntersect < right) {
      const yIntersectDiff = yIntersect - trgY;

      multiplier = yIntersect < trgY ? -1 : 1;

      arrowHeight = arrowSize.height * multiplier;
      // Math.min is used to find a percentage of the arrow size
      // as the arrow approaches a horizontal or vertical vector
      // Math.abs is used to force the diff to be positive,
      // because we're using a multiplier instead and Math.min would choose a large
      // negative number as the minimum, which is undesirable.
      arrowHeight = arrowHeight * Math.min(Math.abs(yIntersectDiff), 1);
    }

    if (yIntersect > top && yIntersect < bottom) {
      const xIntersectDiff = xIntersect - trgX;

      multiplier = xIntersect < trgX ? -1 : 1;

      arrowWidth = arrowSize.width * multiplier;
      arrowWidth = arrowWidth * Math.min(Math.abs(xIntersectDiff), 1);
    }

    response.xOff = trgX - xIntersect - (includesArrow ? arrowWidth / 1.25 : 0);
    response.yOff =
      trgY - yIntersect - (includesArrow ? arrowHeight / 1.25 : 0);

    response.intersect = pathIntersect.points[0];
  }

  return response;
}

export function getCircleIntersect(
  defSvgCircleElement: any,
  src: any,
  trg: any,
  includesArrow?: boolean = true,
  viewWrapperElem: HTMLDivElement
) {
  const response = getDefaultIntersectResponse();
  const arrowSize = getArrowSize(viewWrapperElem);
  const arrowWidth = arrowSize.width;
  const arrowHeight = arrowSize.height;
  const clientRect = defSvgCircleElement.getBoundingClientRect();
  const parentElement = defSvgCircleElement.parentElement;
  let parentWidth = parentElement.getAttribute('width');
  let parentHeight = parentElement.getAttribute('width');

  if (parentWidth) {
    parentWidth = parseFloat(parentWidth);
  }

  if (parentHeight) {
    parentHeight = parseFloat(parentHeight);
  }

  const w = parentWidth ? parentWidth : clientRect.width;
  const h = parentHeight ? parentHeight : clientRect.height;
  const trgX = trg.x || 0;
  const trgY = trg.y || 0;
  const srcX = src.x || 0;
  const srcY = src.y || 0;
  // from the center of the node to the perimeter
  const arrowOffsetDiviser = 1.25;
  const offX = w / 2 + (includesArrow ? arrowWidth / arrowOffsetDiviser : 0);
  const offY = h / 2 + (includesArrow ? arrowHeight / arrowOffsetDiviser : 0);

  // Note: even though this is a circle function, we can use ellipse
  // because all circles are ellipses but not all ellipses are circles.
  const pathIntersect = intersect(
    shape('ellipse', {
      rx: offX,
      ry: offY,
      cx: trgX,
      cy: trgY,
    }),
    shape('line', { x1: srcX, y1: srcY, x2: trgX, y2: trgY })
  );

  if (pathIntersect.points.length > 0) {
    const xIntersect = pathIntersect.points[0].x;
    const yIntersect = pathIntersect.points[0].y;

    response.xOff = trgX - xIntersect;
    response.yOff = trgY - yIntersect;
    response.intersect = pathIntersect.points[0];
  }

  return response;
}

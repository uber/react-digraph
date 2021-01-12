// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/*
  Zoom slider and zoom to fit controls for GraphView
*/

import React, { useCallback } from 'react';
import Parse from 'html-react-parser';
import { DEFAULT_MAX_ZOOM, DEFAULT_MIN_ZOOM, SLIDER_STEPS } from '../constants';
import { useZoomLevelToSliderValue } from '../hooks/useZoomLevelToSliderValue';
import faExpand from '@fortawesome/fontawesome-free/svgs/solid/expand.svg';

const parsedExpandIcon = Parse(faExpand); //  parse SVG once
const ExpandIcon = () => parsedExpandIcon; // convert SVG to react component

type IGraphControlProps = {
  maxZoom?: number,
  minZoom?: number,
  zoomLevel: number,
  zoomToFit: (event: SyntheticMouseEvent<HTMLButtonElement>) => void,
  modifyZoom: (delta: number) => boolean,
};

// Convert slider val (0-steps) to original zoom value range
export function sliderToZoom(val: number, minZoom: number, maxZoom: number) {
  return (val * (maxZoom - minZoom)) / SLIDER_STEPS + minZoom;
}

function GraphControls({
  maxZoom = DEFAULT_MAX_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
  zoomLevel,
  zoomToFit,
  modifyZoom,
}: IGraphControlProps) {
  // Modify current zoom of graph-view
  const zoom = useCallback(
    (e: any) => {
      const sliderVal = e.target.value;
      const zoomLevelNext = sliderToZoom(sliderVal, minZoom, maxZoom);
      const delta = zoomLevelNext - zoomLevel;

      if (zoomLevelNext <= (maxZoom || 0) && zoomLevelNext >= (minZoom || 0)) {
        modifyZoom(delta);
      }
    },
    [minZoom, maxZoom, zoomLevel, modifyZoom]
  );

  const min = useZoomLevelToSliderValue(minZoom, minZoom, maxZoom);
  const max = useZoomLevelToSliderValue(maxZoom, minZoom, maxZoom);
  const value = useZoomLevelToSliderValue(zoomLevel, minZoom, maxZoom);

  return (
    <div className="graph-controls">
      <div className="slider-wrapper">
        <span>-</span>
        <input
          type="range"
          className="slider"
          min={min}
          max={max}
          value={value}
          onChange={zoom}
          step="1"
        />
        <span>+</span>
      </div>
      <button type="button" className="slider-button" onMouseDown={zoomToFit}>
        <ExpandIcon />
      </button>
    </div>
  );
}

export default GraphControls;

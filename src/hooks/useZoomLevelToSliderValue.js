// @flow
import { useMemo } from 'react';
import { DEFAULT_MAX_ZOOM, DEFAULT_MIN_ZOOM, SLIDER_STEPS } from '../constants';

// Convert zoom val (minZoom-maxZoom) to slider range
export function zoomToSlider(val: number, minZoom: number, maxZoom: number) {
  return ((val - minZoom) * SLIDER_STEPS) / (maxZoom - minZoom);
}

export function useZoomLevelToSliderValue(
  value: number,
  min: number = DEFAULT_MIN_ZOOM,
  max: number = DEFAULT_MAX_ZOOM
) {
  return useMemo(() => zoomToSlider(value, min, max), [max, min, value]);
}

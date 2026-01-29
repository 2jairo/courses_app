import webvtt from 'node-webvtt'
import type { ThumbnailsSprite } from './types';

export const parseThumbnails = (vtt: string): ThumbnailsSprite[] => {
  const result = webvtt.parse(vtt)

  return (result.cues || []).map((cue) => {
    const [src, xywh] = cue.text.split("#xywh=");
    const [x, y, w, h] = xywh.split(",").map(Number);

    return {
      start: cue.start,
      end: cue.end,
      src,
      x, y, w, h
    };
  })
}

export const parseSubtitles = (vtt: string) => {
  const result = webvtt.parse(vtt)

  return (result.cues || []).map((cue) => {
    return {
      start: cue.start,
      end: cue.end,
      text: cue.text
    }
  })
}
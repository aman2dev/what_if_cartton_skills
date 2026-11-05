import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13 } from './shots';

// "What if you were stuck on Mars?" No power look: the drama is the planet itself — the storm, the darkening
// window, the red strip. The looks slot stays empty; the fx cues carry the flashes and the turn's shake.

export const marsStuck = defineEpisode('MarsStuck', {
  timeline: timeline as Timeline,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13 },
});

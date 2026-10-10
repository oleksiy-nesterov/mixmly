const mobileQuery = (m: number, d: number) =>
  window.innerWidth <= 430 ? m : d;

export const WALL_SIZE = 500;
export const ATTRACTOR_RADIUS = 10;
export const ATTRACTOR_POSITION_Y = mobileQuery(100, 150);
export const PROCESS_ACTIVE_SLOTS_INTERVAL = 1000;

export const ACTIVE_GLYPH_SCALE = mobileQuery(0.55, 1);
export const GLYPH_SCALE = mobileQuery(0.4, 0.5);
export const GLYPH_MASS = mobileQuery(8, 6);
export const GLYPH_CATEGORY = 0x0002; // do not use deffault category 0x0001
export const SLICE_CATEGORY = 0x0003; // do not use deffault category 0x0001
export const GLYPH_FRICTION_AIR = 0.01;
export const GLYPH_SPACING = 10;

export const DEBUG_RENDER_OPTIONS = {
  fillStyle: 'rgba(255, 0, 0, 0.3)',
  strokeStyle: 'red',
  lineWidth: 1,
};

export const ACTIVE_SLOTS_COUNT = 5;
export const ACTIVE_SLOTS_REGEXP = /^(\d+[+\-*/]\d+=\d+)|(\d+=\d+[+\-*/]\d+)$/;

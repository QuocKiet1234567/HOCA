// Separate tank and office illumination: never stack the office sun onto the tank.
export const LIGHTING = Object.freeze({
  day: Object.freeze({ ambient: .95, sun: 1.35, tankFill: .72, aqua: 4, lamp: 30, exposure: .9, environment: .23, glassReflection: .18, background: 0x84989d, fog: .002 }),
  night: Object.freeze({ ambient: .12, sun: .025, tankFill: .68, aqua: 3, lamp: 28, exposure: .88, environment: .045, glassReflection: .06, background: 0x071019, fog: .001 }),
});

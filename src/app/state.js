/**
 * @typedef {Object} AppState
 * @property {{latitude:number, longitude:number, utcOffsetHours:number, name:string}} observer
 * @property {{year:number, dayOfYear:number, minuteOfDay:number, running:boolean, speed:number}} simulation
 * @property {{mode:'dome'|'horizon', zoom:number, panX:number, panY:number, fullscreen:boolean}} view
 * @property {{names:boolean, lines:boolean, referenceCircles:boolean, zodiac:boolean, twilight:boolean, meteors:boolean, iss:boolean}} layers
 * @property {{activeId:string|null, focusMode:boolean}} scene
 */

/** @returns {AppState} */
export function createInitialState(now = new Date()) {
  return {
    observer: {
      latitude: 48.137,
      longitude: 11.575,
      utcOffsetHours: -now.getTimezoneOffset() / 60,
      name: "München"
    },
    simulation: {
      year: now.getFullYear(),
      dayOfYear: dayOfYearFromDate(now),
      minuteOfDay: now.getHours() * 60 + now.getMinutes(),
      running: false,
      speed: 1
    },
    view: {
      mode: "dome",
      zoom: 1,
      panX: 0,
      panY: 0,
      fullscreen: false
    },
    layers: {
      names: true,
      lines: true,
      referenceCircles: true,
      zodiac: true,
      twilight: false,
      meteors: true,
      iss: false
    },
    scene: {
      activeId: null,
      focusMode: true
    }
  };
}
import { dayOfYearFromDate } from "../features/time/calendar.js";

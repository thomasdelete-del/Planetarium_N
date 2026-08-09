export const SPEED_SLIDER_MIN = 0;
export const SPEED_SLIDER_MAX = 1000;
export const MAX_SLIDER_SPEED = 3600;
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = 86_400;
export const SECONDS_PER_YEAR = 31_556_952;

const finiteNumber = (value, name) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${name} muss endlich sein`);
  return number;
};

export function speedFromSlider(value) {
  const position = finiteNumber(value, "Sliderwert");
  if (position < SPEED_SLIDER_MIN || position > SPEED_SLIDER_MAX) {
    throw new RangeError(`Sliderwert liegt außerhalb ${SPEED_SLIDER_MIN}…${SPEED_SLIDER_MAX}`);
  }
  return Math.exp((position / SPEED_SLIDER_MAX) * Math.log(MAX_SLIDER_SPEED));
}

export function sliderFromSpeed(value) {
  const speed = finiteNumber(value, "Geschwindigkeit");
  if (speed < 1 || speed > MAX_SLIDER_SPEED) {
    throw new RangeError(`Geschwindigkeit liegt außerhalb 1…${MAX_SLIDER_SPEED}`);
  }
  return Math.round((Math.log(speed) / Math.log(MAX_SLIDER_SPEED)) * SPEED_SLIDER_MAX);
}

export function formatSimulationSpeed(value) {
  const speed = finiteNumber(value, "Geschwindigkeit");
  if (speed < 0) throw new RangeError("Geschwindigkeit darf nicht negativ sein");
  if (speed >= SECONDS_PER_HOUR) return "1h/s";
  if (speed >= SECONDS_PER_MINUTE) {
    return `${(speed / SECONDS_PER_MINUTE).toFixed(speed < 600 ? 1 : 0)}min/s`;
  }
  if (speed >= 1) return `${Math.round(speed)}×`;
  return `${speed.toFixed(1)}×`;
}

export const simulationGears = Object.freeze({
  minute: SECONDS_PER_MINUTE,
  hour: SECONDS_PER_HOUR,
  day: SECONDS_PER_DAY,
  year: SECONDS_PER_YEAR
});

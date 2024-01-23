import { DIVISION } from "./constants.js";

const divisionCache = new Map();

function _getDivision(startX, startY, endX, endY, p) {
  const division = [];

  for (let i = 0; i < p; i++) {
    const x = ((endX - startX) / DIVISION) * i + startX;
    const y = ((endY - startY) / DIVISION) * i + startY;
    division.push({ x, y });
  }

  return division;
}

// export const getDivision = _getDivision;

export const getDivision = (...args) => {
  const key = args.join(",");
  if (divisionCache.has(key)) {
    return divisionCache.get(key);
  }

  const division = _getDivision(...args);
  divisionCache.set(key, division);

  return division;
};

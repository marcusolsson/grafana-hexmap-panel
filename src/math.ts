import { Cube, Hex, Point } from './types';

export const axial2Pixel = (hex: Hex, size: number): Point => {
  const x = size * (Math.sqrt(3) * hex.col + (Math.sqrt(3) / 2) * hex.row);
  const y = size * ((3 / 2) * hex.row);
  return { x, y };
};

export const axial2Hex = (point: Point, size: number): Hex => {
  var col = ((Math.sqrt(3) / 3) * point.x - (1 / 3) * point.y) / size;
  var row = ((2 / 3) * point.y) / size;
  return { col, row };
};

export const cube2Oddr = (cube: Cube): Hex => {
  var col = cube.x - (cube.z + (cube.z & 1)) / 2;
  var row = cube.z;
  return { col, row };
};

export const oddr2Cube = (hex: Hex) => {
  var x = hex.col - (hex.row - (hex.row & 1)) / 2;
  var z = hex.row;
  var y = -x - z;
  return { x, y, z };
};

export const cube2Axial = (cube: Cube): Hex => {
  var col = cube.x;
  var row = cube.z;
  return { col, row };
};

export const axial2Cube = (hex: Hex) => {
  var x = hex.col;
  var z = hex.row;
  var y = -x - z;
  return { x, y, z };
};

export const radians2Degrees = (radians: number): number => {
  var pi = Math.PI;
  return radians * (180 / pi);
};

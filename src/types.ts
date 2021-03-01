export interface SimpleOptions {
  padding: number;
  background: boolean;
  valueFieldName?: string;
  sizeByField?: string;
  colorByField?: string;
  groupByField?: string;
  labelByFields: string[];
  guides: boolean;
}

export interface StyledHex {
  shape: Cube;
  valueRowIndex: number;
}

export type Hex = {
  col: number;
  row: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Cube = {
  x: number;
  y: number;
  z: number;
};

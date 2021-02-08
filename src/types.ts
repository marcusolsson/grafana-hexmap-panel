import { DataFrame, Field } from '@grafana/data';

export interface SimpleOptions {
  enableSizeByField: boolean;
  padding: number;
  background: boolean;
  valueFieldName?: string;
  sizeByField?: string;
  colorByField?: string;
  groupByField?: string;
  guides: boolean;
}

export interface StyledHex {
  shape: Cube;
  // size: number;
  valueField: Field<number>;
  sizeField: Field<number>;
  colorField: Field<number>;
  frame: DataFrame;
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

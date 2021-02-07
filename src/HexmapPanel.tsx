import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';

import { HexagonGroup } from './HexagonGroup';

type Group = {
  [value: string]: { indexes: number[]; next?: Group };
};

interface Props extends PanelProps<SimpleOptions> {}

export const HexmapPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const { enableSizeByField, padding, background, guides } = options;

  const { valueFieldName, sizeByField, colorByField, groupByField } = options;

  const frame = data.series[0];

  // No field is set.
  const valueField = frame.fields.find((f) => f.name === valueFieldName);
  if (!valueField) {
    return <p>Select a value field</p>;
  }

  const sizeField = frame.fields.find((f) => f.name === sizeByField) ?? valueField;
  const colorField = frame.fields.find((f) => f.name === colorByField) ?? valueField;

  const margin = 0;

  const chartWidth = width - margin * 2;
  const chartHeight = height - margin * 2;

  let groupedData: Group = {};
  if (groupByField) {
    const groupedField = frame.fields.find((f) => f.name === groupByField);

    const init: Group = {};
    groupedData = groupedField!.values
      .toArray()
      .map((value, index) => ({ value, index }))
      .map((_) => {
        return _;
      })
      .reduce((acc: Group, curr: { value: string; index: number }) => {
        if (!acc[curr.value]) {
          acc[curr.value] = {
            indexes: [],
          };
        }
        acc[curr.value].indexes.push(curr.index);
        return acc;
      }, init);
  } else {
    groupedData = {
      All: {
        indexes: Array.from({ length: frame.length }).map((_, i) => i),
      },
    };
  }

  const numGroups = Object.keys(groupedData).length;

  const aspectRatio = chartWidth / chartHeight;

  let numColumns = 0;
  if (aspectRatio < 0.5) {
    numColumns = 1;
  } else {
    numColumns = Math.min(Math.ceil(aspectRatio) + 1, numGroups);
  }

  const numRows = Math.ceil(numGroups / numColumns);

  let subWidth = chartWidth / numColumns;
  let subHeight = chartHeight / numRows;

  const styles = getStyles();

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <g transform={`translate(${margin}, ${margin})`}>
          {guides ? (
            <rect
              width={chartWidth}
              height={chartHeight}
              className={css`
                fill: none;
                stroke-width: 1;
                stroke: #ffff00;
              `}
            />
          ) : null}
          {groupedData
            ? Object.entries(groupedData).map(([key, value], i) => {
                return (
                  <g
                    key={i}
                    transform={`translate(${(i % numColumns) * subWidth}, ${Math.floor(i / numColumns) * subHeight})`}
                  >
                    <HexagonGroup
                      label={key}
                      padding={padding}
                      frame={data.series[0]}
                      enableSizeByField={enableSizeByField}
                      background={background}
                      width={subWidth}
                      height={subHeight}
                      valueField={valueField}
                      colorField={colorField}
                      sizeField={sizeField}
                      indexes={value.indexes}
                      guides={guides}
                    />
                  </g>
                );
              })
            : null}
        </g>
      </svg>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});

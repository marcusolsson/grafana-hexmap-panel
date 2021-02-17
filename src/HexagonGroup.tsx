import React, { useState } from 'react';
import { axial2Pixel, cube2Oddr } from './math';
import { StyledHex } from './types';
import { Hexagon } from './Hexagon';
import { DataFrame, Field, getFieldDisplayName } from '@grafana/data';
import { ContextMenu, MenuItemsGroup, MenuItem } from '@grafana/ui';
import { css } from 'emotion';

interface Props {
  width: number;
  height: number;

  label: string;
  background: boolean;
  padding: number;
  guides: boolean;

  indexes: number[];

  frame: DataFrame;
  valueField: Field<number>;
  colorField: Field<number>;
  sizeField?: Field<number>;
}

const normalize = (size: number, min: number, max: number) => {
  return (size - min) / (max - min);
};

export const HexagonGroup = React.memo(
  ({ padding, frame, width, height, background, valueField, sizeField, colorField, indexes, label, guides }: Props) => {
    // State for context menu.
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [contextMenuLabel, setContextMenuLabel] = useState<React.ReactNode | string>('');
    const [contextMenuGroups, setContextMenuGroups] = useState<MenuItemsGroup[]>([]);
    const [showContextMenu, setShowContextMenu] = useState(false);

    const labelHeight = 20;

    const margin = 10;
    const chartWidth = width - margin * 2;
    const chartHeight = height - margin * 2;

    const optimized = optimize(chartWidth, chartHeight - labelHeight, indexes.length);

    if (!optimized) {
      return (
        <text
          className={css`
            fill: white;
          `}
        >
          Unable to display
        </text>
      );
    }

    const coords: StyledHex[] = indexes.map((valueRowIndex, i) => ({
      shape: {
        x: i % optimized.cols,
        y: 0,
        z: Math.floor(i / optimized.cols),
      },
      valueField,
      sizeField,
      colorField,
      frame,
      valueRowIndex,
    }));

    return (
      <g transform={`translate(${margin}, ${margin})`}>
        {guides ? (
          <rect
            width={chartWidth}
            height={chartHeight}
            className={css`
              fill: none;
              stroke-width: 1;
              stroke: #00ff00;
            `}
          />
        ) : null}

        <text
          className={css`
            fill: white;
          `}
          x={chartWidth / 2 - measureText(label) / 2}
          y={labelHeight - labelHeight / 4}
        >
          {label}
        </text>
        {showContextMenu
          ? renderContextMenu(contextMenuPos, contextMenuLabel, contextMenuGroups, () => setShowContextMenu(false))
          : null}
        <g transform={`translate(0, ${labelHeight})`}>
          {guides ? (
            <rect
              width={chartWidth}
              height={chartHeight - labelHeight}
              className={css`
                fill: none;
                stroke-width: 1;
                stroke: #00ff00;
              `}
            />
          ) : null}

          {coords.map((_, k) => {
            const axial = cube2Oddr(_.shape);
            const point = axial2Pixel(axial, optimized.R);

            const valueDisplay = _.valueField.display!(_.valueField.values.get(_.valueRowIndex));
            const colorDisplay = _.colorField.display!(_.colorField.values.get(_.valueRowIndex));

            const valueLinks = _.valueField.getLinks!({ valueRowIndex: _.valueRowIndex }).map<MenuItem>((link) => {
              return {
                label: link.title,
                url: link.href,
                target: link.target,
                icon: link.target === '_self' ? 'link' : 'external-link-alt',
                onClick: link.onClick,
              };
            });

            let factor = 1;
            if (sizeField) {
              const min = sizeField.config.min!;
              const max = sizeField.config.max!;
              factor = normalize(sizeField.values.get(_.valueRowIndex), min, max);
            }

            return (
              <g
                key={k}
                transform={`translate(${point.x + (optimized.rows > 1 ? 2 * optimized.r : optimized.r)}, ${
                  point.y + optimized.R
                })`}
              >
                {background ? (
                  <Hexagon circumradius={optimized.R} color={'rgba(255,255,255,0.05)'} animate={false} />
                ) : null}
                <Hexagon
                  onClick={(e) => {
                    setContextMenuPos({ x: e.clientX, y: e.clientY });
                    setShowContextMenu(true);
                    setContextMenuLabel(
                      <small>{`${getFieldDisplayName(_.valueField, _.frame)}: ${valueDisplay.text} ${
                        valueDisplay.suffix ? valueDisplay.suffix : ''
                      }`}</small>
                    );
                    setContextMenuGroups([{ label: valueField.name, items: valueLinks }]);
                  }}
                  circumradius={optimized.R * factor * (1 - padding)}
                  color={colorDisplay.color!}
                  animate={true}
                />
              </g>
            );
          })}
        </g>
      </g>
    );
  }
);

const optimize = (
  w: number,
  h: number,
  N: number
): { valid: boolean; rows: number; cols: number; R: number; r: number } | undefined => {
  let best = undefined;
  for (let r = 1; r < w; r += 0.01) {
    const result = hexesFit(r, w, h, N);
    if (!result.valid) {
      break;
    }
    best = { ...result, r: r };
  }
  return best;
};

const hexesFit = (
  r: number,
  w: number,
  h: number,
  N: number
): { valid: boolean; rows: number; cols: number; R: number } => {
  const cols = Math.floor(w / (2 * r));
  const rows = Math.ceil(N / cols);

  const R = (2 / Math.sqrt(3)) * r;

  if (h < rows * (2 * R)) {
    return { valid: false, rows, cols, R };
  }

  if (w < cols * (2 * r)) {
    return { valid: false, rows, cols, R };
  }

  return { valid: N <= rows * cols, rows, cols, R };
};

const renderContextMenu = (
  pos: { x: number; y: number },
  label: React.ReactNode | string,
  items: MenuItemsGroup[],
  onClose: () => void
) => {
  const contextContentProps = {
    x: pos.x,
    y: pos.y,
    onClose,
    items,
    renderHeader: () => label,
  };

  return <ContextMenu {...contextContentProps} />;
};

const measureText = (text: string): number => {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '14px Arial';
    return ctx.measureText(text).width;
  }
  return 0;
};

import React, { useState } from 'react';
import { css } from 'emotion';

import { Field } from '@grafana/data';
import { ContextMenu, MenuItemsGroup, MenuItem, useTheme } from '@grafana/ui';

import { fieldConfigWithMinMaxCompat, measureText } from 'grafana-plugin-support';

import { Tooltip } from './Tooltip';
import { Hexagon } from './Hexagon';
import { axial2Pixel, cube2Oddr } from './math';
import { StyledHex } from './types';

interface Props {
  width: number;
  height: number;

  label: string;
  background: boolean;
  padding: number;
  guides: boolean;

  indexes: number[];

  colorField: Field<number>;
  sizeField?: Field<number>;
}

const normalize = (size: number, min: number, max: number) => {
  return (size - min) / (max - min);
};

export const HexagonGroup = React.memo(
  ({ padding, width, height, background, sizeField, colorField, indexes, label, guides }: Props) => {
    // State for context menu.
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [contextMenuGroups, setContextMenuGroups] = useState<MenuItemsGroup[]>([]);
    const [showContextMenu, setShowContextMenu] = useState(false);

    const theme = useTheme();

    const labelHeight = 25;

    const margin = 10;
    const chartWidth = width - margin * 2;
    const chartHeight = height - margin * 2;

    const layout = optimizeLayout(chartWidth, chartHeight - labelHeight, indexes.length);

    if (!layout) {
      return (
        <text
          className={css`
            fill: ${theme.colors.text};
            font-size: ${theme.typography.size.lg};
          `}
        >
          {`Unable to layout hexagons`}
        </text>
      );
    }

    const coords: StyledHex[] = indexes.map((valueRowIndex, i) => ({
      valueRowIndex,
      shape: {
        x: i % layout.cols,
        y: 0,
        z: Math.floor(i / layout.cols),
      },
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
            fill: ${theme.colors.text};
            font-size: ${theme.typography.size.lg};
          `}
          x={chartWidth / 2 - (measureText(label, theme.typography.size.lg)?.width ?? 0) / 2}
          y={labelHeight - labelHeight / 4}
        >
          {label}
        </text>

        {showContextMenu && (
          <ContextMenu
            x={contextMenuPos.x}
            y={contextMenuPos.y}
            onClose={() => setShowContextMenu(false)}
            items={contextMenuGroups}
          />
        )}

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

          {coords.map((coord, key) => {
            const axial = cube2Oddr(coord.shape);
            const point = axial2Pixel(axial, layout.R);

            const colorDisplay = colorField.display!(colorField.values.get(coord.valueRowIndex));

            let factor = 1;
            if (sizeField) {
              const config = fieldConfigWithMinMaxCompat(sizeField);
              factor = normalize(sizeField.values.get(coord.valueRowIndex), config.min!, config.max!);
            }

            return (
              <Tooltip key={key} content={<div></div>}>
                <g
                  transform={`translate(${point.x + (layout.rows > 1 ? 2 * layout.r : layout.r)}, ${
                    point.y + layout.R
                  })`}
                >
                  {background && (
                    <Hexagon circumradius={layout.R} color={'rgba(255,255,255,0.05)'} ignoreHover={false} />
                  )}
                  <Hexagon
                    onClick={(e) => {
                      setContextMenuPos({ x: e.clientX, y: e.clientY });
                      setShowContextMenu(true);
                      setContextMenuGroups(
                        [
                          { label: 'Color', field: colorField },
                          { label: 'Size', field: sizeField },
                        ]
                          .filter((_) => _.field)
                          .map<MenuItemsGroup>(({ label, field }) => ({
                            label,
                            items: field!.getLinks!({ valueRowIndex: coord.valueRowIndex }).map<MenuItem>((link) => {
                              return {
                                label: link.title,
                                url: link.href,
                                target: link.target,
                                icon: link.target === '_self' ? 'link' : 'external-link-alt',
                                onClick: link.onClick,
                              };
                            }),
                          }))
                      );
                    }}
                    circumradius={layout.R * factor * (1 - padding)}
                    color={colorDisplay.color!}
                    ignoreHover={true}
                  />
                </g>
              </Tooltip>
            );
          })}
        </g>
      </g>
    );
  }
);

const optimizeLayout = (
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

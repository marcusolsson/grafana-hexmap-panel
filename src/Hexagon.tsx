import React from 'react';

import { css, cx } from 'emotion';

interface Props {
  circumradius: number;
  color: string;
  animate: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const Hexagon = React.memo(({ onClick, circumradius, color, animate: ignoreHover }: Props) => {
  const R = circumradius; // Circumradius
  const deg60 = Math.PI / 3;
  const deg30 = Math.PI / 6;

  const angles = Array.from({ length: 6 }).map((_, i) => i * deg60 + deg30);
  const values = angles.map(_ => ({ x: R * Math.cos(_), y: R * Math.sin(_) }));

  const hoverStyle = css`
    transform: scale(1);
    transition: all 100ms ease-in;
    opacity: 0.8;

    filter: brightness(100%);
    -webkit-filter: brightness(100%);

    &:hover {
      cursor: pointer;
      transition: all 100ms ease-in;
      opacity: 1;
      filter: brightness(120%);
      -webkit-filter: brightness(120%);
    }
  `;

  return (
    <polygon
      points={values.map(_ => `${_.x.toFixed(5)},${_.y.toFixed(5)}`).join(' ')}
      className={cx(
        css`
          fill: ${color};
        `,
        { [hoverStyle]: ignoreHover }
      )}
      onClick={e => {
        if (onClick) {
          onClick(e);
        }
      }}
    />
  );
});

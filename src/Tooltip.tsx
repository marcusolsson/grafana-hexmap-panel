import React from 'react';

import { useTheme } from '@grafana/ui';

import { css } from 'emotion';

// Tippy
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';

interface Props {
  content: React.ReactNode;
  children: React.ReactElement<any>;
  followMouse?: boolean;
}

export const Tooltip = ({ content, children, followMouse }: Props) => {
  const theme = useTheme();
  const styles = {
    root: css`
      border-radius: ${theme.border.radius.md};
      background-color: ${theme.colors.bg2};
      padding: ${theme.spacing.sm};
      box-shadow: 0px 0px 20px ${theme.colors.dropdownShadow};
    `,
  };

  return (
    <Tippy
      content={content}
      followCursor={!!followMouse}
      plugins={[followCursor]}
      animation={false}
      className={styles.root}
    >
      {children}
    </Tippy>
  );
};

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
  disable?: boolean;
}

export const Tooltip = ({ content, children, followMouse, disable }: Props) => {
  const theme = useTheme();

  if (disable) {
    return children;
  }

  const styles = {
    root: css`
      max-width: 500px;
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
      placement="bottom"
    >
      {children}
    </Tippy>
  );
};

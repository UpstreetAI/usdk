'use client';

import React, { forwardRef } from 'react';
import { IconButton } from 'ucom';

interface AgentDeleteProps {
  handleClick: () => void;
}

export const AgentDelete = forwardRef<HTMLDivElement, AgentDeleteProps>(
  ({ handleClick }, ref) => {
    return (
      <div ref={ref}>
        <IconButton
          onClick={handleClick}
          icon="Trash"
          size="small"
          variant="primary"
        />
      </div>
    );
  }
);
'use client';

import React from 'react';
import { IconButton } from 'ucom';

interface AgentDeleteProps {
  handleClick: () => void;
}

export function AgentDelete({ handleClick }: AgentDeleteProps) {
  return (
    <IconButton
      onClick={handleClick}
      icon="Trash"
      size="small"
      variant="primary"
    />
  );
}

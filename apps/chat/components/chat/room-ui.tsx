'use client';

import { useEffect, useState } from 'react';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import { ChatTabs } from './chat-tabs';

export function RoomUi() {
  return (
    <div>
      <ChatTabs />
    </div>
  );
};
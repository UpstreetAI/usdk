import React, { useState, useEffect } from 'react';
import { useAgent, useSupabase } from '../../hooks';
import {
  PingManager,
} from '../../classes/ping-manager';

export const Ping = () => {
  const agent = useAgent();
  const supabase = useSupabase();

  const [pingManager, setPingManager] = useState(() => new PingManager({
    userId: agent.id,
    supabase,
  }));

  useEffect(() => {
    pingManager.live();
    return () => {
      pingManager.destroy();
    };
  }, []);

  return null;
};
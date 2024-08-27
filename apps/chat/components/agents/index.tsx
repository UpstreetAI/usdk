'use client';

import React, { useEffect, useState } from 'react';
import { AgentList } from './AgentList';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Button } from '../ui/button';

export interface AgentsProps {
  loadmore: boolean
  range: number
}

export function Agents({ loadmore = false, range = 5 }: AgentsProps) {
  const { supabase } = useSupabase();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(range);

  const [showLoadMore, setShowLoadMore] = useState(loadmore);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadAgents() {

    if (agents.length) {
      setLoadingMore(true);
    }

    const { error, data } = await supabase
      .from('assets')
      .select(`
        *,
        author: accounts ( name )
      `)
      .eq('origin', 'sdk')
      .range(rangeFrom, rangeTo - 1)
      .order('created_at', { ascending: false });

    if (!error) {

      if (agents) {
        const newAgents = agents.concat(data);
        setAgents(newAgents);
        setLoadingMore(false);
      } else {
        setAgents(data);
      }

      if (loadmore) {
        setRangeFrom(rangeTo);
        setRangeTo(rangeTo + range);
      }

      if (data.length < range) {
        setShowLoadMore(false)
      }

      setLoading(false);

    } else {
      console.error(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <>
      <div>
        <AgentList agents={agents} loading={loading} />
      </div>
      <div className='text-center'>
        {showLoadMore &&
          <Button
            disabled={loadingMore}
            className='mt-10'
            onClick={loadAgents}
          >
            {loadingMore ? "Loading agents..." : "Load More"}
          </Button>
        }
      </div>
    </>
  );
}

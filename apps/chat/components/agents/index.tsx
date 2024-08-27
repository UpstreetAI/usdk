'use client';

import React, { useEffect, useState } from 'react';
import { AgentList } from './AgentList';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Button } from '../ui/button';

export interface AgentsProps {
  loadmore: boolean
  range: number
  grid: number
  gap: number
}

export function Agents({ loadmore = false, range = 5, grid = 2, gap = 2 }: AgentsProps) {
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
        author: accounts ( id, name )
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
        setShowLoadMore(false);
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
      <div className={`grid grid-cols-${grid} gap-${gap}`}>
        <AgentList agents={agents} loading={loading} />
      </div>
      <div className='text-center'>
        {!agents.length || showLoadMore &&
          <Button
            disabled={loadingMore}
            className='cursor-pointer h-auto mt-10 bg-[#ff38ae] inline-block hover:opacity-[0.6] text-xl font-bold text-white px-8 py-4 rounded-md mr-2 mb-2'
            onClick={loadAgents}
          >
            {loadingMore ? "Loading agents..." : "Load More"}
          </Button>
        }
      </div>
    </>
  );
}

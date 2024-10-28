'use client';

import React, { useEffect, useState } from 'react';
import { AgentList } from './AgentList';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Button } from 'ucom';

export interface Agent {
  id: number;
  name: string;
}

export interface AgentsProps {
  loadmore: boolean;
  search: boolean;
  range: number;
  row: boolean;
}

export interface UserAgentsProps {
  loadmore: boolean;
  search: boolean;
  range: number;
  row: boolean;
  agents: Agent[];
}

export function Agents({ loadmore = false, search = true, range = 5, row = false }: AgentsProps) {
  const { supabase } = useSupabase();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(range);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const fetchData = async (
    reset = false,
    customRangeFrom = rangeFrom,
    customRangeTo = rangeTo
  ) => {

    if (searchTerm !== '') {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from('assets')
      .select('*, author: accounts ( id, name )')
      .eq('origin', 'sdk')
      .ilike('name', `%${debouncedSearchTerm}%`)
      .range(customRangeFrom, customRangeTo - 1)
      .order('created_at', { ascending: false });

    if (!error) {
      if (reset) {
        setAgents(data);
      } else {
        setAgents((prevAgents) => [...prevAgents, ...data]);
      }

      if (data.length < range) {
        setShowLoadMore(false);
      } else {
        setShowLoadMore(true);
      }

      setLoading(false);
      setLoadingMore(false);
    } else {
      console.error(error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    setRangeFrom(0);
    setRangeTo(range);
    fetchData(true, 0, range);
  }, [debouncedSearchTerm]);

  const handleLoadMore = () => {
    const newRangeFrom = rangeTo;
    const newRangeTo = rangeTo + range;

    setRangeFrom(newRangeFrom);
    setRangeTo(newRangeTo);

    setLoadingMore(true);
    fetchData(false, newRangeFrom, newRangeTo);
  };

  return (
    <>
      {search && (
        <div className='flex mb-4'>
          <h1 className='text-3xl font-bold text-left text-[#2D4155] w-full'>
            Agents
          </h1>
          <input
            type='text'
            placeholder='Search agents...'
            value={searchTerm}
            className='w-60 px-4 py-2 bg-gray-100 border-2 border-gray-900 text-gray-900 text-sm'
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      )}

      <div className={`grid ${row ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        <AgentList agents={agents} loading={loading} range={range} />
      </div>
      {loadmore && (
        <div className='text-center pt-8'>
          {agents.length > 0 && showLoadMore && (
            <Button
              size='large'
              onClick={handleLoadMore}
            >
              {loadingMore ? 'Loading agents...' : 'Load More'}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export function UserAgents({ agents = [], loadmore = false, search = true, range = 5, row = false }: UserAgentsProps) {
  const { supabase } = useSupabase();

  const [userAgents, setUserAgents] = useState<Agent[]>(agents);
  const [loading, setLoading] = useState(false);
  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(range);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  return (
    <>
      <div className={`grid ${row ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        <AgentList agents={userAgents} loading={loading} range={range} />
      </div>
    </>
  );
}

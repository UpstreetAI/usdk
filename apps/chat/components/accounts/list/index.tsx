'use client';

import React, { useEffect, useState } from 'react';
import { AccountList } from './AccountList';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Button } from '@/components/ui/button';

export interface AgentsProps {
  loadmore: boolean;
  range: number;
}

export interface Account {
  id: number;
  name: string;
}

export function Accounts({ loadmore = false, range = 5 }: AgentsProps) {
  const { supabase } = useSupabase();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(range);
  const [showLoadMore, setShowLoadMore] = useState(loadmore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (reset = false) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*, agents: assets(*)')
      .ilike('name', `%${searchTerm}%`)
      .range(rangeFrom, rangeTo - 1)
      .order('created_at', { ascending: false });

    if (!error) {
      if (reset) {
        setAccounts(data);
      } else {
        setAccounts((prevAccounts) => [...prevAccounts, ...data]);
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
    fetchData(true);
  }, [searchTerm]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setRangeFrom(rangeTo);
    setRangeTo(rangeTo + range);
    fetchData();
  };

  return (
    <>
      <div className='flex mb-4'>
        <h1 className='text-3xl font-bold text-left text-[#90A0B2] w-full'>Accounts</h1>
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchTerm}
          className='w-60 px-4 py-2 bg-gray-100 border-2 border-gray-900 text-gray-900 text-sm'
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setRangeFrom(0);
            setRangeTo(range);
          }}
        />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        <AccountList accounts={accounts} loading={loading} range={range} />
      </div>

      <div className='text-center'>
        {showLoadMore && (
          <Button
            disabled={loadingMore}
            onClick={handleLoadMore}
            className='cursor-pointer h-auto mt-10 bg-[#ff38ae] inline-block hover:opacity-[0.6] text-xl font-bold text-white px-8 py-4 rounded-md mr-2 mb-2'
          >
            {loadingMore ? "Loading agents..." : "Load More"}
          </Button>
        )}
      </div>
    </>
  );
}

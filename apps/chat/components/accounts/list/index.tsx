'use client';

import React, { useEffect, useState } from 'react';
import { AccountList } from './AccountList';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Button } from 'ucom';

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
      .from('accounts')
      .select('*, agents: assets(*)')
      .ilike('name', `%${searchTerm}%`)
      .ilike('name', `%${debouncedSearchTerm}%`)
      .range(customRangeFrom, customRangeTo - 1)
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
      <div className='flex mb-4'>
        <h1 className='text-3xl font-bold text-left text-[#2D4155] w-full'>Accounts</h1>
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchTerm}
          className='w-60 px-4 py-2 bg-gray-100 border-2 border-gray-900 text-gray-900 text-sm'
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        <AccountList accounts={accounts} loading={loading} range={range} />
      </div>

      <div className='text-center pt-8'>
        {showLoadMore && (
          <Button
            size='large'
            onClick={handleLoadMore}
          >
            {loadingMore ? 'Loading agents...' : 'Load More'}
          </Button>
        )}
      </div>
    </>
  );
}

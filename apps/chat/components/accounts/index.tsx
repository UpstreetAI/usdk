'use client';

import React, { useEffect, useState } from 'react';
import { AccountList } from './AccountList';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Button } from '../ui/button';

export interface AgentsProps {
  loadmore: boolean
  range: number
}

export function Accounts({ loadmore = false, range = 5 }: AgentsProps) {
  const { supabase } = useSupabase();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(range);

  const [showLoadMore, setShowLoadMore] = useState(loadmore);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadAccounts() {

    if (accounts.length) {
      setLoadingMore(true);
    }

    const { error, data } = await supabase
      .from('accounts')
      .select('*')
      // .eq('assets.origin', 'sdk')
      .range(rangeFrom, rangeTo - 1)
      .order('created_at', { ascending: false });



      console.log(data);

    if (!error) {

      if (accounts) {
        const newAccounts = accounts.concat(data);
        setAccounts(newAccounts);
        setLoadingMore(false);
      } else {
        setAccounts(data);
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
    loadAccounts();
  }, []);

  return accounts.length ? (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
        <AccountList accounts={accounts} loading={loading} />
      </div>
      <div className='text-center'>
        {!accounts.length || showLoadMore &&
          <Button
            disabled={loadingMore}
            className='cursor-pointer h-auto mt-10 bg-[#ff38ae] inline-block hover:opacity-[0.6] text-xl font-bold text-white px-8 py-4 rounded-md mr-2 mb-2'
            onClick={loadAccounts}
          >
            {loadingMore ? "Loading agents..." : "Load More"}
          </Button>
        }
      </div>
    </>
  ) : null;
}

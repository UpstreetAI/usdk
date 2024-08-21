'use client';

import React from 'react';

export interface AgentsProps {
  creditsUsageHistory: any;
}

export function Credits({ creditsUsageHistory }: AgentsProps) {
  return (
    <div className="m-auto w-full max-w-4xl">
      <div className="sm:flex sm:flex-col sm:align-center pt-4 pb-4">
        <h1 className="text-2xl font-extrabold text-white sm:text-center sm:text-4xl">
          Credits
        </h1>
        <p className="max-w-2xl m-auto mt-4 text-lg text-zinc-200 sm:text-center sm:text-xl">
          Credits usage history.
        </p>
      </div>
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <div className="flex flex-col m-auto mt-5 w-full max-w-4xl">
          <div className='flex'>
                <p className='w-full font-bold'>Date</p>
                <p className='w-60 font-bold text-right'>Service</p>
                <p className='w-40 font-bold text-right'>Amount</p>
                </div>

            {creditsUsageHistory?.map((creditHistoryItem: any, i: number) => {
              return (
                <div className='flex text-[#efefef]' key={i}>
                <p className='w-full'>{creditHistoryItem?.created_at}</p>
                <p className='w-60 text-right'>{creditHistoryItem?.service}</p>
                <p className='w-40 text-right'>{creditHistoryItem?.amount}</p>
                </div>
              );
            })}
      </div>
    </div>
    </div>
    </div>
  )
}

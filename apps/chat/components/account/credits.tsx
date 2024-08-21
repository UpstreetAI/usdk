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
          Overall credits usage history.
        </p>
      </div>
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">

            <thead className="text-xs text-gray-50 uppercase bg-border">
              <tr>
                <th key={'preview'} scope="col" className="px-6 w-[60px] py-3 text-[rgba(255,255,255,0.6)]">Date</th>
                <th key={'info'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Service</th>
                <th key={'creds'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Credits Used</th>
              </tr>
            </thead>

            <tbody>
              {creditsUsageHistory?.map((creditHistoryItem: any, i: number) => {

                return (
                  <tr className="hover:bg-border text-white bg-[rgba(255,255,255,0.1)] mt-1" key={i}>

                    <td key={'t-1'} className="px-6 py-4 text-md capitalize align-top">
                      {creditHistoryItem?.created_at}
                    </td>
                    <td key={'t-2'} className="px-6 py-4 text-md capitalize align-top">
                      {creditHistoryItem?.service}
                    </td>
                    <td key={'t-3'} className="px-6 py-4 text-md capitalize align-top">
                      {creditHistoryItem?.amount}
                    </td>

                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

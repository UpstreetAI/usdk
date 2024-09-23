'use client';

import { isValidUrl } from "@/utils/helpers/urls";
import Image from "next/image";

export interface AgentListProps {
  account: any
}

export function AccountRow({ account }: AgentListProps) {
  return (
    <div className="bg-gray-100 border p-4 text-black">
      <div className="flex">
        <div className="mr-4 size-[160px] min-w-[160px] flex items-center justify-center bg-cover">
          {account.preview_url && isValidUrl(account.preview_url) ? (
            <Image src={account.preview_url} alt="" className="h-full" width={160} height={160} />
          ) : (
            <div className='uppercase text-lg font-bold'>{account.name.charAt(0)}</div>
          )}
        </div>
        <div className="min-w-40 text-md capitalize w-full">
          <a href={`/accounts/${account.id}`} className="block hover:underline">
            <div className="font-bold text-lg line-clamp-1">{account.name}</div>
            <div className="line-clamp-2">{account.description}</div>
          </a>
        </div>
        <div className="text-center ml-6">Agents: <span className="text-4xl">{account?.agents.length}</span></div>
      </div>
    </div>
  );
}

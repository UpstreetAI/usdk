'use client';

import { AccountRow } from "./AccountRow";

export interface AccountListProps {
  accounts: object[]
  loading: boolean
}

export function AccountList({ accounts, loading }: AccountListProps) {

  if (loading) return <div className="animate-pulse text-center p-4 text-xl">Loading agents...</div>;

  if (!accounts.length) return 'No agents found.';

  return accounts.map((account: any, index: number) => <AccountRow account={account} key={index} />);
}

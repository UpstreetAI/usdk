'use client';

import { AccountRow, SkeletonAccountRow } from "./AccountRow";

export interface AccountListProps {
  accounts: object[]
  loading: boolean
  range: number
}

export function AccountList({ accounts, loading, range }: AccountListProps) {

  if (loading) return (
    <>
      {Array.from({ length: range }).map((_, index) => (
        <SkeletonAccountRow key={index} />
      ))}
    </>
  );

  if (!accounts.length) return 'No agents found.';

  return accounts.map((account: any, index: number) => <AccountRow account={account} key={index} />);
}

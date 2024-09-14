import React from 'react';
import { Accounts } from '@/components/accounts';

export default function AccountsPage() {
  return (
    <div className="relative w-full mx-auto max-w-6xl px-4 py-8">
      <Accounts loadmore={true} range={12} />
    </div>
  );
}

'use client';

import ReactMarkdown from 'react-markdown';
// eslint-disable-next-line sort-imports
import { useEffect, useState } from 'react';
import { AccountSubscriptions } from '@/components/account/subscriptions';

export default function Pricing() {

  const [md, setMd] = useState('');

  async function getMD(dir: string) {
    return await fetch(dir).then((res) => res.text());
  }

  useEffect(() => {
    void getMD('/md/terms.md').then((res) => {
      setMd(res);
    });
  }, []);

  return (
    <div className="w-full mx-auto max-w-6xl px-6 pt-8 pb-16 markdown">
      <AccountSubscriptions />
    </div>
  );
}

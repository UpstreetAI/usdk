import { AccountSubscriptions } from '@/components/account/subscriptions';
import { getJWT } from '@/lib/jwt';
import { redirect } from 'next/navigation';

export default async function Pricing() {
  const jwt = await getJWT();
  if (jwt) {
    return redirect('/account#subscriptions');
  }
  return (
    <div className="w-full mx-auto max-w-6xl px-6 pt-8 pb-16 markdown">
      <AccountSubscriptions />
    </div>
  );
};

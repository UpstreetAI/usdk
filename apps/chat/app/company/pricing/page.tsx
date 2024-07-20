import Pricing from '@/components/ui/Pricing/Pricing';
// import { createClient } from '@/utils/supabase/server';
// import { getSupabase } from '@/lib/hooks/use-supabase';
import { makeAnonymousClient } from '@/utils/supabase/supabase-client';
import { env } from '@/lib/env'

export default async function PricingPage() {
  // const supabase = createClient();
  const supabase = makeAnonymousClient(env);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: subscription, error } = await supabase
    .from('up_subscriptions')
    .select('*, up_prices(*, up_products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.log(error);
  }

  const { data: products } = await supabase
    .from('up_products')
    .select('*, up_prices(*)')
    .eq('active', true)
    .eq('up_prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'up_prices' });

  return (
    <Pricing
      user={user}
      products={products ?? []}
      subscription={subscription}
    />
  );
}

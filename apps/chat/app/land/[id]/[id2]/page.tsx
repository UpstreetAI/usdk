import React from 'react';
import { waitForUser } from '@/utils/supabase/server'
import { Land } from '@/components/land';

export default async function LandPage(props: {
  params: {
    id: string,
    id2: string,
  },
}) {
  const { id, id2 } = props.params;

  const user = await waitForUser();
  if (!user) {
    return null;
  }

  return (
    <Land
      id={[id, id2].join('/')}
      user={user}
    />
  );
}

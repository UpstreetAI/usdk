import React from 'react';
import { waitForUser } from '@/utils/supabase/server'
import { Land } from '@/components/land';

export default async function LandPage(props: {
  params: {
    id: string,
  },
}) {
  const { id } = props.params;

  const user = await waitForUser();
  if (!user) {
    return null;
  }
  
  return (
    <Land
      id={id}
      user={user}
    />
  );
}

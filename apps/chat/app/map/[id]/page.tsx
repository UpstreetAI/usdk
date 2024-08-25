import React from 'react';
// import { useRouter } from 'next/navigation'
// import type { Coord2D } from '@/components/map';
import { Map, getMapUrlCoord, setMapUrlCoord, snapCoord } from '@/components/map';
// import { Vector3 } from 'three';
import { waitForUser } from '@/utils/supabase/server';

export default async function MapPage(props: {
  params: {
    id: string
  },
}) {
  const user = await waitForUser();
  if (!user) {
    return null;
  }

  const { id } = props.params;

  return (
    <Map
      id={id}
      user={user}
    />
  );
};

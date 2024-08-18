'use client';

import { Map } from '@/components/map'
import { useSearchParams } from 'next/navigation'

export default function MapPage({
  id,
}: {
  id: string,
}) {
  // parse the query string
  const query = useSearchParams();
  const edit = !!query.get('edit');

  return (
    <Map
      id={id}
      edit={edit}
    />
  );
}

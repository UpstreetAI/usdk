'use client';

import { Land } from '@/components/land'
import { useSearchParams } from 'next/navigation'

export default function LandPage({
  id,
}: {
  id: string,
}) {
  // parse the query string
  const query = useSearchParams();
  const edit = query.get('edit') !== null;
  
  return (
    <Land
      id={id}
      edit={edit}
    />
  );
}

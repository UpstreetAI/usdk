'use client';

import { Land } from '@/components/land'
// import { useSearchParams } from 'next/navigation'

export default function LandPage({
  id,
}: {
  id: string,
}) {
  const loadUrl = new URL(location.href);
  const query = loadUrl.searchParams;
  const edit = query.get('edit') !== null;
  
  return (
    <Land
      id={id}
      edit={edit}
    />
  );
}
